import { z } from 'zod';
import { isoTimestamp, latitude, longitude, uuid } from './common';

export const mosque = z.object({
  id: uuid,
  community_id: uuid.nullable(),
  name: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  province: z.string().nullable(),
  postal_code: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  source: z.enum(['osm', 'manual', 'admin_claim']),
  verified_at: isoTimestamp.nullable(),
  created_at: isoTimestamp,
});
export type Mosque = z.infer<typeof mosque>;

// distance_m is only present on nearby queries, hence a separate shape.
export const mosqueWithDistance = mosque.extend({ distance_m: z.number() });
export type MosqueWithDistance = z.infer<typeof mosqueWithDistance>;

export const nearbyQuery = z.object({
  lat: latitude,
  lng: longitude,
  radius_m: z.coerce.number().int().min(100).max(200_000).default(25_000),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type NearbyQuery = z.infer<typeof nearbyQuery>;

// Fields Google licenses for live display but not for storage. Served from cache,
// never persisted to Postgres alongside the mosque row.
export const mosqueEnrichment = z.object({
  phone: z.string().nullable(),
  website: z.string().nullable(),
  opening_hours: z.array(z.string()).nullable(),
  fetched_at: isoTimestamp,
});
export type MosqueEnrichment = z.infer<typeof mosqueEnrichment>;

// Submitted by a member who could not find their mosque. Only the name is required --
// someone adding the place they pray should not be blocked because they do not know the
// postal code.
export const mosqueCreate = z.object({
  name: z.string().min(2).max(200),
  address: z.string().max(300).optional(),
  city: z.string().max(120).optional(),
  province: z
    .enum(['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'])
    .optional(),
  postal_code: z.string().max(12).optional(),
  phone: z.string().max(40).optional(),
  website: z.string().url().max(300).optional(),
  lat: latitude.optional(),
  lng: longitude.optional(),
  notes: z.string().max(1000).optional(),
});
export type MosqueCreate = z.infer<typeof mosqueCreate>;
