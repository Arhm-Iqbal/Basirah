import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { incidentCreate } from '@basirah/shared';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';

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
