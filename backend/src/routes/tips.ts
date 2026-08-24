import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { tipCreate, tipStatusQuery } from '@basirah/shared';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { generateClaimCode, hashClaimCode } from '../lib/claim';
import { verifyTurnstile } from '../lib/turnstile';
import { fail, zodFail } from '../lib/errors';

export const tips = new Hono<Env>();

// Nothing here reads the Authorization header, and nothing writes the client IP. Both
// omissions are deliberate: a tip that can be traced back to its author is not anonymous.
tips.post(
  '/',
  zValidator('json', tipCreate, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const body = c.req.valid('json');

    if (!(await verifyTurnstile(c.env, body.turnstile_token))) {
      return fail(c, 403, 'challenge_failed', 'Could not verify this submission is human.');
    }

    const claimCode = generateClaimCode();
    const { turnstile_token, ...report } = body;

    const row: Record<string, unknown> = {
      mosque_id: report.mosque_id ?? null,
      channel: report.channel,
      category: report.category ?? null,
      occurred_at: report.occurred_at ?? null,
      description: report.description,
      details: report.details,
      claim_code_hash: await hashClaimCode(claimCode),
    };

    if (report.channel === 'in_person' && report.lat != null && report.lng != null) {
      row.location = `SRID=4326;POINT(${report.lng} ${report.lat})`;
    }

    const db = serviceClient(c.env);
    const { data, error } = await db
      .from('tips')
      .insert(row)
      .select('id, status, created_at')
      .single();

    if (error) return fail(c, 500, 'insert_failed', error.message);

    // The only time the plaintext code ever exists in a response.
    return c.json({ ...data, claim_code: claimCode }, 201);
  },
);

tips.post(
  '/status',
  zValidator('json', tipStatusQuery, (r, c) =>
    r.success ? undefined : zodFail(c, r.error.issues),
  ),
  async (c) => {
    const { claim_code } = c.req.valid('json');
    const db = serviceClient(c.env);

    const { data, error } = await db
      .from('tips')
      .select('status, created_at, updated_at')
      .eq('claim_code_hash', await hashClaimCode(claim_code))
      .maybeSingle();

    if (error) return fail(c, 500, 'query_failed', error.message);
    if (!data) return fail(c, 404, 'not_found', 'No report matches that code.');

    return c.json(data);
  },
);
