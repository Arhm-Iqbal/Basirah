import { Hono } from 'hono';
import type { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';
import { isUuid } from '../lib/params';

const STAFF_ROLES = ['mosque_admin', 'security_officer', 'regional_coordinator'];

export const admin = new Hono<Env>();

admin.use('*', requireAuth);

// pending_incidents() scopes itself by auth.uid(), which only resolves if the caller's own
// JWT travels with the call. The service role would resolve auth.uid() to null and return
// nothing, so this one read deliberately does not use serviceClient.
function callerClient(c: Context<Env>) {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: c.req.header('Authorization') ?? '' } },
  });
}

// A plain member gets 403 rather than an empty queue: the RPC cannot tell "no staff role"
// apart from "nothing waiting", and the screen has to say which.
admin.get('/incidents', async (c) => {
  const { data: staff, error: staffError } = await serviceClient(c.env)
    .from('memberships')
    .select('mosque_id')
    .eq('profile_id', c.get('userId'))
    .in('role', STAFF_ROLES)
    .limit(1);

  if (staffError) {
    console.error(staffError);
    return fail(c, 500, 'query_failed', 'Could not load the review queue.');
  }
  if (!staff || staff.length === 0) {
    return fail(c, 403, 'forbidden', 'Reviewing reports is limited to mosque staff.');
  }

  const { data, error } = await callerClient(c).rpc('pending_incidents');

  if (error) {
    console.error(error);
    return fail(c, 500, 'query_failed', 'Could not load the review queue.');
  }
  return c.json({ data: data ?? [], next_cursor: null });
});

const verifyBody = z.object({
  status: z.enum(['verified', 'false_alarm', 'triaged', 'resolved']),
  note: z.string().trim().max(1000).optional(),
});

admin.post(
  '/incidents/:id/verify',
  zValidator('json', verifyBody, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const id = c.req.param('id');
    if (!isUuid(id)) return fail(c, 404, 'not_found', 'No report with that id.');

    const { status, note } = c.req.valid('json');
    const db = serviceClient(c.env);

    const { data: incident, error: lookupError } = await db
      .from('incidents')
      .select('id, mosque_id, details')
      .eq('id', id)
      .maybeSingle();

    if (lookupError) {
      console.error(lookupError);
      return fail(c, 500, 'query_failed', 'Could not load that report.');
    }
    if (!incident) return fail(c, 404, 'not_found', 'No report with that id.');
    if (!incident.mosque_id) {
      return fail(c, 403, 'forbidden', 'You cannot review that report.');
    }

    // Re-checked here rather than trusted from the queue the client was shown: the id comes
    // from the request, so entitlement has to be proven again at the moment of the write.
    const { data: membership, error: roleError } = await db
      .from('memberships')
      .select('role')
      .eq('profile_id', c.get('userId'))
      .eq('mosque_id', incident.mosque_id)
      .in('role', STAFF_ROLES)
      .maybeSingle();

    if (roleError) {
      console.error(roleError);
      return fail(c, 500, 'query_failed', 'Could not check your access.');
    }
    if (!membership) return fail(c, 403, 'forbidden', 'You cannot review that report.');

    const details = (incident.details ?? {}) as Record<string, unknown>;
    const log = Array.isArray(details.verification_log) ? details.verification_log : [];

    const { data, error } = await db
      .from('incidents')
      .update({
        status,
        details: {
          ...details,
          verification_log: [
            ...log,
            {
              actor_id: c.get('userId'),
              role: membership.role,
              status,
              note: note && note.length > 0 ? note : null,
              at: new Date().toISOString(),
            },
          ],
        },
      })
      .eq('id', id)
      .select('id, status, updated_at')
      .single();

    if (error) {
      console.error(error);
      return fail(c, 500, 'update_failed', 'Could not update that report.');
    }
    return c.json(data);
  },
);
