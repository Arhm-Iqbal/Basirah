import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nearbyQuery } from '@basirah/shared';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { enrichFromPlaces } from '../lib/google';
import { fail, zodFail } from '../lib/errors';

export const mosques = new Hono<Env>();

mosques.get(
  '/',
  zValidator('query', nearbyQuery, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const { lat, lng, radius_m, limit } = c.req.valid('query');
    const db = serviceClient(c.env);

    const { data, error } = await db.rpc('mosques_nearby', {
      in_lat: lat,
      in_lng: lng,
      in_radius_m: radius_m,
      in_limit: limit,
    });

    if (error) return fail(c, 500, 'query_failed', error.message);
    return c.json({ data: data ?? [], next_cursor: null });
  },
);

mosques.get('/:id', async (c) => {
  const db = serviceClient(c.env);
  const { data, error } = await db.from('mosques').select('*').eq('id', c.req.param('id')).maybeSingle();

  if (error) return fail(c, 500, 'query_failed', error.message);
  if (!data) return fail(c, 404, 'not_found', 'No mosque with that id.');

  const { location, google_place_id, ...rest } = data;
  return c.json(rest);
});

// Live-only. The response is not persisted, because Google's terms do not license these
// fields for storage beyond a short cache window.
mosques.get('/:id/enrichment', async (c) => {
  const db = serviceClient(c.env);
  const { data, error } = await db
    .from('mosques')
    .select('name, city, province')
    .eq('id', c.req.param('id'))
    .maybeSingle();

  if (error) return fail(c, 500, 'query_failed', error.message);
  if (!data) return fail(c, 404, 'not_found', 'No mosque with that id.');

  const query = [data.name, data.city, data.province, 'Canada'].filter(Boolean).join(', ');
  const enrichment = await enrichFromPlaces(c.env, query);

  if (!enrichment) return fail(c, 502, 'enrichment_unavailable', 'Places returned no match.');
  return c.json({ ...enrichment, fetched_at: new Date().toISOString() });
});
