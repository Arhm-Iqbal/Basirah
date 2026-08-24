import { apiFetch } from '@/lib/api-base';
import { createClient } from '@/lib/supabase/client';
import type { IncidentActionPlan } from '@basirah/shared';

export type NearbyMosque = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  distance_m: number;
};

export async function fetchNearbyMosques(
  lat: number,
  lng: number,
  radiusM = 25_000,
  limit = 50,
): Promise<NearbyMosque[]> {
  const { data, error } = await createClient().rpc('mosques_nearby', {
    in_lat: lat,
    in_lng: lng,
    in_radius_m: radiusM,
    in_limit: limit,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as NearbyMosque[];
}

export type OwnIncident = {
  id: string;
  channel: string;
  category: string | null;
  status: string;
  description: string | null;
  occurred_at: string | null;
  created_at: string;
  details: Record<string, unknown>;
};

export async function fetchOwnIncidents(): Promise<OwnIncident[]> {
  const res = await apiFetch('/v1/incidents', { headers: await authHeaders() });
  const body = (await unwrap(res)) as { data?: OwnIncident[] };
  return body.data ?? [];
}

export type GeocodeResult = { label: string; lat: number; lng: number };

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  const res = await apiFetch(`/v1/geocode?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Geocoding failed.');
  const body = (await res.json()) as { data: GeocodeResult[] };
  return body.data;
}

export type MyMosque = {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  website: string | null;
  source: string;
  verified_at: string | null;
  added_at: string;
};

export type Enrichment = {
  place_id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: string[] | null;
  fetched_at: string;
};

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  if (!session?.access_token) throw new Error('You are signed out. Sign in and try again.');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` };
}

async function unwrap(res: Response) {
  if (res.ok) return res.status === 204 ? null : res.json();
  const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  throw new Error(body?.error?.message ?? 'That did not work. Try again.');
}

export async function fetchMyMosques(): Promise<MyMosque[]> {
  const { data, error } = await createClient().rpc('profile_mosques');
  if (error) throw new Error(error.message);
  return (data ?? []) as MyMosque[];
}

export type NewMosque = {
  name: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
  notes?: string;
};

export async function createMosque(input: NewMosque): Promise<{ id: string; name: string }> {
  const res = await apiFetch('/v1/me/mosques/new', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return (await unwrap(res)) as { id: string; name: string };
}

export async function addMosqueToProfile(mosqueId: string): Promise<void> {
  const res = await apiFetch('/v1/me/mosques', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ mosque_id: mosqueId }),
  });
  await unwrap(res);
}

export async function removeMosqueFromProfile(mosqueId: string): Promise<void> {
  const res = await apiFetch(`/v1/me/mosques/${mosqueId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await unwrap(res);
}

// 502 here means Google simply had no match, which is common for smaller prayer spaces.
// That is not an error worth surfacing -- the stored OSM profile still stands on its own.
// Nothing here may reject: the callers render an indefinite "Loading..." that only a
// settled promise clears, so a network failure has to arrive as an absent result.
export async function fetchEnrichment(mosqueId: string): Promise<Enrichment | null> {
  const res = await apiFetch(`/v1/mosques/${mosqueId}/enrichment`).catch(() => null);
  if (!res?.ok) return null;
  return (await res.json().catch(() => null)) as Enrichment | null;
}

export type MosqueEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  url: string | null;
  source: string;
};

export async function fetchMosqueEvents(mosqueId: string): Promise<MosqueEvent[]> {
  const res = await apiFetch(`/v1/events/${mosqueId}`).catch(() => null);
  if (!res?.ok) return [];
  const body = (await res.json().catch(() => null)) as { data?: MosqueEvent[] } | null;
  return body?.data ?? [];
}

export type ReportDocument = {
  url: string;
  version: number;
  byte_size: number | null;
  created_at: string;
};

export async function fetchReportDocument(incidentId: string): Promise<ReportDocument> {
  const res = await apiFetch(`/v1/incidents/${incidentId}/document`, {
    headers: await authHeaders(),
  });
  return (await unwrap(res)) as ReportDocument;
}

export async function fetchIncidentActions(incidentId: string): Promise<IncidentActionPlan> {
  const res = await apiFetch(`/v1/incidents/${incidentId}/actions`, {
    headers: await authHeaders(),
  });
  return (await unwrap(res)) as IncidentActionPlan;
}

// The signed URL points at Supabase Storage, so the anchor is what actually saves the
// file; navigating there directly would render the PDF instead of downloading it.
export async function downloadReport(incidentId: string) {
  const doc = await fetchReportDocument(incidentId);
  const filename = `basirah-report-${incidentId.slice(0, 8)}.pdf`;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    const opened = window.open(doc.url, '_blank', 'noopener,noreferrer');
    if (!opened) window.location.assign(doc.url);
    return;
  }

  const res = await fetch(doc.url);
  if (!res.ok) throw new Error('Could not fetch the document.');
  const blob = await res.blob();
  const file = new File([blob], filename, { type: 'application/pdf' });
  const href = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
}

export type DeleteReportScope = 'me' | 'everyone';

export async function deleteReport(incidentId: string, scope: DeleteReportScope): Promise<void> {
  const res = await apiFetch(`/v1/incidents/${incidentId}?scope=${scope}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await unwrap(res);
}

export async function appealReport(incidentId: string, reason: string): Promise<void> {
  const res = await apiFetch(`/v1/incidents/${incidentId}/appeal`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ reason }),
  });
  await unwrap(res);
}

export async function editReport(
  incidentId: string,
  patch: { description?: string; category?: string | null },
): Promise<void> {
  const res = await apiFetch(`/v1/incidents/${incidentId}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  await unwrap(res);
}

export async function tidyWriting(text: string): Promise<{ original: string; rewritten: string }> {
  const res = await apiFetch('/v1/assist/rewrite', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ text }),
  });
  return (await unwrap(res)) as { original: string; rewritten: string };
}
