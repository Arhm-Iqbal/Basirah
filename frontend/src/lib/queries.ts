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

export type MapIncident = {
  id: string;
  category: string | null;
  channel: string;
  lat: number;
  lng: number;
  occurred_at: string | null;
  created_at: string;
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

// Verified incidents only, coarse coordinates, no reporter and no free text. The RPC
// enforces all three; the client cannot widen it.
export async function fetchMapIncidents(
  lat: number,
  lng: number,
  radiusM = 50_000,
): Promise<MapIncident[]> {
  const { data, error } = await createClient().rpc('incidents_map', {
    in_lat: lat,
    in_lng: lng,
    in_radius_m: radiusM,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as MapIncident[];
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
  const { data, error } = await createClient()
    .from('incidents')
    .select('id, channel, category, status, description, occurred_at, created_at, details')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as OwnIncident[];
}

export type GeocodeResult = { label: string; lat: number; lng: number };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function geocodePlace(query: string): Promise<GeocodeResult[]> {
  const res = await fetch(`${API_URL}/v1/geocode?q=${encodeURIComponent(query)}`);
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
  const res = await fetch(`${API_URL}/v1/me/mosques/new`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(input),
  });
  return (await unwrap(res)) as { id: string; name: string };
}

export async function addMosqueToProfile(mosqueId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/me/mosques`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ mosque_id: mosqueId }),
  });
  await unwrap(res);
}

export async function removeMosqueFromProfile(mosqueId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/me/mosques/${mosqueId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await unwrap(res);
}

// 502 here means Google simply had no match, which is common for smaller prayer spaces.
// That is not an error worth surfacing -- the stored OSM profile still stands on its own.
export async function fetchEnrichment(mosqueId: string): Promise<Enrichment | null> {
  const res = await fetch(`${API_URL}/v1/mosques/${mosqueId}/enrichment`);
  if (!res.ok) return null;
  return (await res.json()) as Enrichment;
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
  const res = await fetch(`${API_URL}/v1/events/${mosqueId}`);
  if (!res.ok) return [];
  const body = (await res.json()) as { data: MosqueEvent[] };
  return body.data;
}

export type ReportDocument = {
  url: string;
  version: number;
  byte_size: number | null;
  created_at: string;
};

export async function fetchReportDocument(incidentId: string): Promise<ReportDocument> {
  const res = await fetch(`${API_URL}/v1/incidents/${incidentId}/document`, {
    headers: await authHeaders(),
  });
  return (await unwrap(res)) as ReportDocument;
}

export async function fetchIncidentActions(incidentId: string): Promise<IncidentActionPlan> {
  const res = await fetch(`${API_URL}/v1/incidents/${incidentId}/actions`, {
    headers: await authHeaders(),
  });
  return (await unwrap(res)) as IncidentActionPlan;
}

// The signed URL points at Supabase Storage, so the anchor is what actually saves the
// file; navigating there directly would render the PDF instead of downloading it.
export async function downloadReport(incidentId: string) {
  const doc = await fetchReportDocument(incidentId);
  const res = await fetch(doc.url);
  if (!res.ok) throw new Error('Could not fetch the document.');
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = `basirah-report-${incidentId.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export async function deleteReport(incidentId: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/incidents/${incidentId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  await unwrap(res);
}

export async function appealReport(incidentId: string, reason: string): Promise<void> {
  const res = await fetch(`${API_URL}/v1/incidents/${incidentId}/appeal`, {
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
  const res = await fetch(`${API_URL}/v1/incidents/${incidentId}`, {
    method: 'PATCH',
    headers: await authHeaders(),
    body: JSON.stringify(patch),
  });
  await unwrap(res);
}
