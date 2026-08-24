import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { incidentCreate } from '@basirah/shared';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';
import { isUuid } from '../lib/params';
import { buildContext, generateGuidance } from '../lib/guidance';
import { z } from 'zod';
import {
  currentDocument,
  generateAndStore,
  removeDocuments,
  signDocument,
} from '../lib/report-store';

export const incidents = new Hono<Env>();

incidents.use('*', requireAuth);

incidents.post(
  '/',
  zValidator('json', incidentCreate, (r, c) =>
    r.success ? undefined : zodFail(c, r.error.issues),
  ),
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
    c.executionCtx.waitUntil(
      generateAndStore(db, data.id).catch((err: unknown) => {
        console.error('pdf generation failed', err);
      }),
    );

    return c.json(data, 201);
  },
);

incidents.get('/', async (c) => {
  const db = serviceClient(c.env);
  const { data, error } = await db
    .from('incidents')
    .select(
      'id, mosque_id, channel, category, status, occurred_at, description, details, created_at, updated_at',
    )
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

// Editing is allowed only before anyone has acted on the report. Once it is verified or
// alerted it has been broadcast on, and letting the author silently rewrite it afterwards
// would make verification meaningless.
const EDITABLE = ['submitted', 'triaged'];

const incidentPatch = z.object({
  description: z.string().min(1).max(10_000).optional(),
  category: z.string().max(40).nullish(),
  occurred_at: z.string().datetime({ offset: true }).nullish(),
  details: z.record(z.unknown()).optional(),
});

async function ownIncident(c: any, id: string) {
  const db = serviceClient(c.env);
  const { data, error } = await db
    .from('incidents')
    .select('id, status, reporter_id')
    .eq('id', id)
    .eq('reporter_id', c.get('userId'))
    .maybeSingle();
  if (error) {
    console.error(error);
    return { db, incident: null, failed: true };
  }
  return { db, incident: data, failed: false };
}

incidents.patch(
  '/:id',
  zValidator('json', incidentPatch, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const id = c.req.param('id');
    if (!isUuid(id)) return fail(c, 404, 'not_found', 'No report with that id.');

    const { db, incident, failed } = await ownIncident(c, id);
    if (failed) return fail(c, 500, 'query_failed', 'Could not load that report.');
    if (!incident) return fail(c, 404, 'not_found', 'No report with that id.');
    if (!EDITABLE.includes(incident.status)) {
      return fail(
        c,
        409,
        'not_editable',
        'This report has already been reviewed and can no longer be edited.',
      );
    }

    const patch = c.req.valid('json');
    const { data, error } = await db
      .from('incidents')
      .update(patch)
      .eq('id', id)
      .select('id, channel, category, status, description, occurred_at, created_at, updated_at')
      .single();

    if (error) {
      console.error(error);
      return fail(c, 500, 'update_failed', 'Could not save those changes.');
    }

    // The stored document now describes an older version of the report; supersede it.
    c.executionCtx.waitUntil(
      generateAndStore(db, id).catch((err: unknown) => {
        console.error('pdf regeneration failed', err);
      }),
    );

    return c.json(data);
  },
);

incidents.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (!isUuid(id)) return fail(c, 404, 'not_found', 'No report with that id.');

  const { db, incident, failed } = await ownIncident(c, id);
  if (failed) return fail(c, 500, 'query_failed', 'Could not load that report.');
  if (!incident) return fail(c, 404, 'not_found', 'No report with that id.');

  // Rows cascade from the incident, but storage objects do not -- clear them first so a
  // deleted report cannot leave its PDF sitting in the bucket.
  await removeDocuments(db, id);

  const { error } = await db.from('incidents').delete().eq('id', id);
  if (error) {
    console.error(error);
    return fail(c, 500, 'delete_failed', 'Could not delete that report.');
  }

  return c.body(null, 204);
});

incidents.get('/:id/document', async (c) => {
  const id = c.req.param('id');
  if (!isUuid(id)) return fail(c, 404, 'not_found', 'No report with that id.');

  const { db, incident, failed } = await ownIncident(c, id);
  if (failed) return fail(c, 500, 'query_failed', 'Could not load that report.');
  if (!incident) return fail(c, 404, 'not_found', 'No report with that id.');

  // Regenerate on demand when the background render failed or has not landed yet, so a
  // missing document is never a dead end.
  let doc = await currentDocument(db, id);
  if (!doc) {
    try {
      await generateAndStore(db, id);
      doc = await currentDocument(db, id);
    } catch (err) {
      console.error(err);
      return fail(c, 502, 'document_failed', 'Could not produce a PDF for this report.');
    }
  }
  if (!doc) return fail(c, 502, 'document_failed', 'Could not produce a PDF for this report.');

  const url = await signDocument(db, doc.storage_path);
  if (!url) return fail(c, 502, 'document_failed', 'Could not produce a download link.');

  return c.json({
    url,
    version: doc.version,
    byte_size: doc.byte_size,
    created_at: doc.created_at,
  });
});
