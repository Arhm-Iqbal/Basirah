import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../lib/env';
import { fail, zodFail } from '../lib/errors';

export const geocode = new Hono<Env>();

// Nominatim's usage policy requires an identifying User-Agent and low volume. Proxying
// through the Worker is what lets us guarantee both; a browser calling it directly would
// send whatever UA it likes and get the whole project blocked.
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const UA = 'basirah/0.1 (community mosque directory; contact@basirah.ca)';

geocode.get(
  '/',
  zValidator('query', z.object({ q: z.string().min(2).max(200) }), (r, c) =>
    r.success ? undefined : zodFail(c, r.error.issues),
  ),
  async (c) => {
    const { q } = c.req.valid('query');

    const url = new URL(NOMINATIM);
    url.searchParams.set('q', q);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '5');
    url.searchParams.set('countrycodes', 'ca');

    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
    if (!res.ok) return fail(c, 502, 'geocode_unavailable', 'Could not look up that place.');

    const body = (await res.json()) as Array<Record<string, any>>;
    const data = body.map((p) => ({
      label: p.display_name as string,
      lat: Number(p.lat),
      lng: Number(p.lon),
    }));

    return c.json({ data, next_cursor: null });
  },
);
