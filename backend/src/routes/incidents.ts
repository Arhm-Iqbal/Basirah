import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { incidentCreate } from '@basirah/shared';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';
import { isUuid } from '../lib/params';
import { buildContext, generateGuidance } from '../lib/guidance';

export const incidents = new Hono<Env>();

incidents.use('*', requireAuth);

incidents.post(
  '/',
  zValidator('json', incidentCreate, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const report = c.req.valid('json');

    const row: Record<string, unknown> = {
      reporter_id: c.get('userId'),
      mosque_id: report.mosque_id ?? null,
      channel: report.channel,
      category: report.category ?? null,
      occurred_at: report.occurred_at ?? null,
      description: report.description,
      details: report.details,
    };

    if (report.channel === 'in_person' && report.lat != null && report.lng != null) {
      row.location = `SRID=4326;POINT(${report.lng} ${report.lat})`;
    }

    const db = serviceClient(c.env);
    const { data, error } = await db
      .from('incidents')
      .insert(row)
      .select('id, status, channel, created_at')
      .single();

    if (error) return fail(c, 500, 'insert_failed', error.message);
    return c.json(data, 201);
  },
);

incidents.get('/', async (c) => {
  const db = serviceClient(c.env);
  const { data, error } = await db
    .from('incidents')
    .select('id, mosque_id, channel, category, status, occurred_at, description, details, created_at, updated_at')
    .eq('reporter_id', c.get('userId'))
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return fail(c, 500, 'query_failed', error.message);
  return c.json({ data: data ?? [], next_cursor: null });
});

// Guidance is generated on demand rather than at submit time so a slow or failing model
// call can never block someone filing a report.
incidents.post('/:id/guidance', async (c) => {
  const id = c.req.param('id');
  if (!isUuid(id)) return fail(c, 404, 'not_found', 'No report with that id.');

  const db = serviceClient(c.env);
  const { data: incident, error } = await db
    .from('incidents')
    .select('id, channel, category, description, details, mosque_id, reporter_id')
    .eq('id', id)
    .eq('reporter_id', c.get('userId'))
    .maybeSingle();

  if (error) {
    console.error(error);
    return fail(c, 500, 'query_failed', 'Could not load that report.');
  }
  if (!incident) return fail(c, 404, 'not_found', 'No report with that id.');

  const cached = (incident.details as Record<string, any>)?.guidance;
  if (cached) return c.json(cached);

  if (!c.env.ANTHROPIC_API_KEY) {
    return fail(c, 503, 'guidance_unavailable', 'Guidance is not configured on this server.');
  }

  // Province only, never the address: enough to name the right provincial body, not enough
  // to place anyone.
  let province: string | null = null;
  if (incident.mosque_id) {
    const { data: mosque } = await db
      .from('mosques')
      .select('province')
      .eq('id', incident.mosque_id)
      .maybeSingle();
    province = mosque?.province ?? null;
  }

  try {
    const guidance = await generateGuidance(c.env, buildContext(incident, province));

    await db
      .from('incidents')
      .update({ details: { ...(incident.details as object), guidance } })
      .eq('id', id);

    return c.json(guidance);
  } catch (err) {
    console.error(err);
    return fail(c, 502, 'guidance_failed', 'Could not generate next steps right now.');
  }
});
