import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';
import { isUuid } from '../lib/params';
import { ingestFromWebsiteDeep } from '../lib/events';

export const events = new Hono<Env>();

// Reading is public, matching the directory. Only the write path needs a session.
events.get('/:mosqueId', async (c) => {
  const mosqueId = c.req.param('mosqueId');
  if (!isUuid(mosqueId)) return fail(c, 404, 'not_found', 'No mosque with that id.');

  const db = serviceClient(c.env);
  const { data, error } = await db.rpc('mosque_upcoming_events', { in_mosque: mosqueId });

  if (error) {
    console.error(error);
    return fail(c, 500, 'query_failed', 'Could not load events.');
  }
  return c.json({ data: data ?? [], next_cursor: null });
});

const eventCreate = z.object({
  mosque_id: z.string().uuid(),
  title: z.string().min(2).max(300),
  description: z.string().max(2000).optional(),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }).nullish(),
  url: z.string().url().max(500).optional(),
});

events.post(
  '/',
  requireAuth,
  zValidator('json', eventCreate, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const body = c.req.valid('json');
    const db = serviceClient(c.env);

    // Anyone can add a mosque, but only its staff can publish events on its profile --
    // otherwise the directory becomes a posting board.
    const { data: staff, error: staffError } = await db
      .from('memberships')
      .select('role')
      .eq('profile_id', c.get('userId'))
      .eq('mosque_id', body.mosque_id)
      .in('role', ['mosque_admin', 'regional_coordinator'])
      .maybeSingle();

    if (staffError) {
      console.error(staffError);
      return fail(c, 500, 'query_failed', 'Could not check your permissions.');
    }
    if (!staff) {
      return fail(c, 403, 'not_permitted', 'Only a mosque administrator can add events here.');
    }

    const { data, error } = await db
      .from('mosque_events')
      .insert({
        mosque_id: body.mosque_id,
        title: body.title.trim(),
        description: body.description?.trim() ?? null,
        starts_at: body.starts_at,
        ends_at: body.ends_at ?? null,
        url: body.url ?? null,
        source: 'admin',
        source_ref: `admin-${crypto.randomUUID()}`,
      })
      .select('id, title, starts_at, ends_at, url')
      .single();

    if (error) {
      console.error(error);
      return fail(c, 500, 'insert_failed', 'Could not save that event.');
    }
    return c.json(data, 201);
  },
);

// Pulling a mosque's own site on demand. Staff-gated because it costs a model call and
// writes to a profile other people read.
events.post('/:mosqueId/refresh', requireAuth, async (c) => {
  const mosqueId = c.req.param('mosqueId');
  if (!mosqueId || !isUuid(mosqueId)) {
    return fail(c, 404, 'not_found', 'No mosque with that id.');
  }

  const db = serviceClient(c.env);

  const { data: staff } = await db
    .from('memberships')
    .select('role')
    .eq('profile_id', c.get('userId'))
    .eq('mosque_id', mosqueId)
    .in('role', ['mosque_admin', 'regional_coordinator'])
    .maybeSingle();
  if (!staff) {
    return fail(c, 403, 'not_permitted', 'Only a mosque administrator can refresh events.');
  }

  const { data: mosque } = await db
    .from('mosques')
    .select('name, website')
    .eq('id', mosqueId)
    .maybeSingle();
  if (!mosque) return fail(c, 404, 'not_found', 'No mosque with that id.');
  if (!mosque.website) {
    return fail(c, 422, 'no_website', 'This mosque has no website on file to read from.');
  }

  try {
    const result = await ingestFromWebsiteDeep(db, c.env, mosqueId, mosque.name, mosque.website);
    return c.json({ ...result, total: result.ics + result.scraped });
  } catch (err) {
    console.error(err);
    return fail(c, 502, 'ingest_failed', 'Could not read events from that website.');
  }
});
