import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { mosqueCreate } from '@basirah/shared';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';
import { isUuid } from '../lib/params';

export const me = new Hono<Env>();

me.use('*', requireAuth);

me.get('/mosques', async (c) => {
  const db = serviceClient(c.env);
  const { data, error } = await db
    .from('memberships')
    .select('role, created_at, mosques(id, name, address, city, province, phone, website, source)')
    .eq('profile_id', c.get('userId'))
    .order('created_at', { ascending: true });

  if (error) return fail(c, 500, 'query_failed', error.message);

  const rows = (data ?? []).flatMap((m: Record<string, any>) =>
    m.mosques ? [{ ...m.mosques, role: m.role, added_at: m.created_at }] : [],
  );
  return c.json({ data: rows, next_cursor: null });
});

me.post(
  '/mosques',
  zValidator('json', z.object({ mosque_id: z.string().uuid() }), (r, c) =>
    r.success ? undefined : zodFail(c, r.error.issues),
  ),
  async (c) => {
    const { mosque_id } = c.req.valid('json');
    const db = serviceClient(c.env);

    const { data: mosque, error: lookupError } = await db
      .from('mosques')
      .select('id')
      .eq('id', mosque_id)
      .maybeSingle();

    if (lookupError) return fail(c, 500, 'query_failed', lookupError.message);
    if (!mosque) return fail(c, 404, 'not_found', 'No mosque with that id.');

    const { data, error } = await db
      .from('memberships')
      .upsert(
        { profile_id: c.get('userId'), mosque_id, role: 'member' },
        { onConflict: 'profile_id,mosque_id', ignoreDuplicates: false },
      )
      .select('mosque_id, role, created_at')
      .single();

    if (error) return fail(c, 500, 'insert_failed', error.message);
    return c.json(data, 201);
  },
);

me.delete('/mosques/:id', async (c) => {
  const id = c.req.param('id');
  if (!isUuid(id)) return fail(c, 404, 'not_found', 'No mosque with that id.');

  const db = serviceClient(c.env);
  const { error } = await db
    .from('memberships')
    .delete()
    .eq('profile_id', c.get('userId'))
    .eq('mosque_id', id);

  if (error) {
    console.error(error);
    return fail(c, 500, 'delete_failed', 'Could not remove that mosque.');
  }
  return c.body(null, 204);
});

// Adding a mosque and joining it are one action: someone filling this in is telling us
// where they pray, so making them add it and then find it again would be busywork.
// source stays 'manual' and verified_at stays null, which keeps it off the public
// directory until a person confirms it.
me.post(
  '/mosques/new',
  zValidator('json', mosqueCreate, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const body = c.req.valid('json');
    const db = serviceClient(c.env);

    const row: Record<string, unknown> = {
      name: body.name.trim(),
      address: body.address?.trim() ?? null,
      city: body.city?.trim() ?? null,
      province: body.province ?? null,
      postal_code: body.postal_code?.trim() ?? null,
      phone: body.phone?.trim() ?? null,
      website: body.website?.trim() ?? null,
      source: 'manual',
      details: body.notes?.trim() ? { notes: body.notes.trim() } : {},
    };

    if (body.lat != null && body.lng != null) {
      row.location = `SRID=4326;POINT(${body.lng} ${body.lat})`;
    }

    const { data: mosque, error: insertError } = await db
      .from('mosques')
      .insert(row)
      .select('id, name, address, city, province, phone, website, source')
      .single();

    if (insertError) {
      console.error(insertError);
      return fail(c, 500, 'insert_failed', 'Could not save that mosque.');
    }

    const { error: joinError } = await db
      .from('memberships')
      .upsert(
        { profile_id: c.get('userId'), mosque_id: mosque.id, role: 'member' },
        { onConflict: 'profile_id,mosque_id' },
      );

    if (joinError) {
      console.error(joinError);
      return fail(c, 500, 'insert_failed', 'Saved the mosque but could not add it to your profile.');
    }

    return c.json(mosque, 201);
  },
);
