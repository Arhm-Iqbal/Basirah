import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../lib/env';
import { serviceClient } from '../lib/supabase';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';
import { isUuid } from '../lib/params';

export const media = new Hono<Env>();

media.use('*', requireAuth);

const BUCKET = 'incident-media';
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES_PER_INCIDENT = 8;
const DOWNLOAD_TTL_SECONDS = 300;

const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;

const uploadUrlBody = z.object({
  incident_id: z.string(),
  filename: z.string().min(1).max(255),
  mime_type: z.enum(MIME_TYPES),
  size_bytes: z.number().int().positive().max(MAX_FILE_BYTES),
});

// A report the caller does not own answers exactly like one that does not exist, so the API
// never confirms that someone else's incident id is real.
const NOT_FOUND = 'No report with that id.';

media.post(
  '/upload-url',
  zValidator('json', uploadUrlBody, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    const { incident_id, mime_type, size_bytes } = c.req.valid('json');
    if (!isUuid(incident_id)) return fail(c, 404, 'not_found', NOT_FOUND);

    const db = serviceClient(c.env);

    const { data: incident, error: lookupError } = await db
      .from('incidents')
      .select('id')
      .eq('id', incident_id)
      .eq('reporter_id', c.get('userId'))
      .is('reporter_hidden_at', null)
      .maybeSingle();

    if (lookupError) {
      console.error(lookupError);
      return fail(c, 500, 'query_failed', 'Could not load that report.');
    }
    if (!incident) return fail(c, 404, 'not_found', NOT_FOUND);

    const { count, error: countError } = await db
      .from('incident_media')
      .select('id', { count: 'exact', head: true })
      .eq('incident_id', incident_id);

    if (countError) {
      console.error(countError);
      return fail(c, 500, 'query_failed', 'Could not load that report.');
    }
    if ((count ?? 0) >= MAX_FILES_PER_INCIDENT) {
      return fail(
        c,
        409,
        'too_many_files',
        `A report can carry at most ${MAX_FILES_PER_INCIDENT} files.`,
      );
    }

    const id = crypto.randomUUID();
    const storagePath = `${incident_id}/${id}`;

    const { data: signed, error: signError } = await db.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);

    if (signError || !signed) {
      console.error(signError);
      return fail(c, 502, 'storage_unavailable', 'Could not attach that file right now.');
    }

    // The row lands only after signing succeeds, so a storage outage cannot leave a media
    // record pointing at an object that was never uploadable.
    const { data, error: insertError } = await db
      .from('incident_media')
      .insert({ id, incident_id, storage_path: storagePath, mime_type, size_bytes })
      .select('id, incident_id, mime_type, size_bytes, created_at')
      .single();

    if (insertError) {
      console.error(insertError);
      return fail(c, 500, 'insert_failed', 'Could not attach that file.');
    }

    return c.json({ ...data, upload_url: signed.signedUrl, token: signed.token }, 201);
  },
);

media.get('/:incident_id', async (c) => {
  const incidentId = c.req.param('incident_id');
  if (!isUuid(incidentId)) return fail(c, 404, 'not_found', NOT_FOUND);

  const db = serviceClient(c.env);

  const { data: incident, error: lookupError } = await db
    .from('incidents')
    .select('id')
    .eq('id', incidentId)
    .eq('reporter_id', c.get('userId'))
    .is('reporter_hidden_at', null)
    .maybeSingle();

  if (lookupError) {
    console.error(lookupError);
    return fail(c, 500, 'query_failed', 'Could not load that report.');
  }
  if (!incident) return fail(c, 404, 'not_found', NOT_FOUND);

  const { data: rows, error } = await db
    .from('incident_media')
    .select('id, incident_id, storage_path, mime_type, size_bytes, created_at')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return fail(c, 500, 'query_failed', 'Could not load the attached files.');
  }
  if (!rows || rows.length === 0) return c.json({ data: [], next_cursor: null });

  const { data: signed, error: signError } = await db.storage.from(BUCKET).createSignedUrls(
    rows.map((row) => row.storage_path as string),
    DOWNLOAD_TTL_SECONDS,
  );

  if (signError) {
    console.error(signError);
    return fail(c, 502, 'storage_unavailable', 'Could not load the attached files right now.');
  }

  const urls = new Map<string, string>();
  for (const entry of signed ?? []) {
    if (entry.path && entry.signedUrl) urls.set(entry.path, entry.signedUrl);
  }

  return c.json({
    data: rows.map((row) => ({
      id: row.id,
      incident_id: row.incident_id,
      mime_type: row.mime_type,
      size_bytes: row.size_bytes,
      created_at: row.created_at,
      download_url: urls.get(row.storage_path as string) ?? null,
      expires_in: DOWNLOAD_TTL_SECONDS,
    })),
    next_cursor: null,
  });
});
