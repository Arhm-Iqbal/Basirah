import { createClient } from '@/lib/supabase/client';

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
