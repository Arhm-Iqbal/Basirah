import type { SupabaseClient } from '@supabase/supabase-js';
import { buildReportPdf, type ReportPdfInput } from './pdf';

const BUCKET = 'report-documents';

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
    .from(BUCKET)
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
  const { data } = await db.storage.from(BUCKET).createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}

// Storage has no cascade, so the objects must go explicitly when a report is deleted.
export async function removeDocuments(db: SupabaseClient, incidentId: string) {
  const { data } = await db
    .from('report_documents')
    .select('storage_path')
    .eq('incident_id', incidentId);
  const paths = (data ?? []).map((d) => d.storage_path as string);
  if (paths.length > 0) await db.storage.from(BUCKET).remove(paths);
}
