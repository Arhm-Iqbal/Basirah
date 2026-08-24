import type { SupabaseClient } from '@supabase/supabase-js';
import { buildReportPdf, type ReportPdfInput } from './pdf';

const DOCUMENT_BUCKET = 'report-documents';
const MEDIA_BUCKET = 'incident-media';

async function loadForPdf(db: SupabaseClient, incidentId: string): Promise<ReportPdfInput | null> {
  const { data, error } = await db
    .from('incidents')
    .select(
      'id, channel, category, status, description, occurred_at, created_at, details, mosque_id',
    )
    .eq('id', incidentId)
    .maybeSingle();

  if (error || !data) return null;

  let mosqueName: string | null = null;
  if (data.mosque_id) {
    const { data: mosque } = await db
      .from('mosques')
      .select('name')
      .eq('id', data.mosque_id)
      .maybeSingle();
    mosqueName = mosque?.name ?? null;
  }

  return {
    ...data,
    details: (data.details ?? {}) as Record<string, unknown>,
    mosque_name: mosqueName,
  };
}

// Rendering runs after the submit response, so a slow render can never delay someone
// filing. A failure here leaves the report intact and simply without a document yet --
// the download route regenerates on demand.
export async function generateAndStore(
  db: SupabaseClient,
  incidentId: string,
): Promise<{ path: string; version: number } | null> {
  const incident = await loadForPdf(db, incidentId);
  if (!incident) return null;

  const bytes = await buildReportPdf(incident);

  const { data: latest } = await db
    .from('report_documents')
    .select('version')
    .eq('incident_id', incidentId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const version = (latest?.version ?? 0) + 1;
  const path = `${incidentId}/v${version}.pdf`;

  const { error: uploadError } = await db.storage
    .from(DOCUMENT_BUCKET)
    .upload(path, bytes, { contentType: 'application/pdf', upsert: true });
  if (uploadError) throw new Error(uploadError.message);

  const { error: rowError } = await db
    .from('report_documents')
    .insert({ incident_id: incidentId, storage_path: path, version, byte_size: bytes.byteLength });
  if (rowError) throw new Error(rowError.message);

  return { path, version };
}

export async function currentDocument(db: SupabaseClient, incidentId: string) {
  const { data } = await db
    .from('report_documents')
    .select('storage_path, version, byte_size, created_at')
    .eq('incident_id', incidentId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function signDocument(db: SupabaseClient, path: string): Promise<string | null> {
  const { data } = await db.storage.from(DOCUMENT_BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

async function storedPaths(
  db: SupabaseClient,
  table: 'report_documents' | 'incident_media',
  incidentId: string,
): Promise<string[]> {
  const { data, error } = await db.from(table).select('storage_path').eq('incident_id', incidentId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.storage_path as string);
}

async function removeStoredObjects(
  db: SupabaseClient,
  bucket: string,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await db.storage.from(bucket).remove(paths);
  if (error) throw new Error(error.message);
}

// Database rows cascade from the incident, but Storage objects do not. Permanent deletion
// therefore clears every generated PDF and attachment before the incident row is removed.
export async function removeIncidentFiles(db: SupabaseClient, incidentId: string): Promise<void> {
  const [documentPaths, mediaPaths] = await Promise.all([
    storedPaths(db, 'report_documents', incidentId),
    storedPaths(db, 'incident_media', incidentId),
  ]);

  await Promise.all([
    removeStoredObjects(db, DOCUMENT_BUCKET, documentPaths),
    removeStoredObjects(db, MEDIA_BUCKET, mediaPaths),
  ]);
}
