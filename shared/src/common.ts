import { z } from 'zod';

export const uuid = z.string().uuid();
export const isoTimestamp = z.string().datetime({ offset: true });

export const errorBody = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ErrorBody = z.infer<typeof errorBody>;

export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({ data: z.array(item), next_cursor: z.string().nullable() });
}

export const cursorQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Mirrors the CHECK constraints in supabase/migrations. Both sides are provisional
// until the report form exists; keep them in step with the migrations when they move.
export const incidentChannel = z.enum(['online', 'in_person']);
export type IncidentChannel = z.infer<typeof incidentChannel>;

export const incidentCategory = z.enum([
  'vandalism',
  'threat',
  'assault',
  'harassment',
  'intimidation',
  'property_damage',
  'online_hate',
  'other',
]);
export type IncidentCategory = z.infer<typeof incidentCategory>;

export const incidentStatus = z.enum([
  'submitted',
  'triaged',
  'verified',
  'alerted',
  'resolved',
  'false_alarm',
]);
export type IncidentStatus = z.infer<typeof incidentStatus>;

export const membershipRole = z.enum([
  'member',
  'mosque_admin',
  'security_officer',
  'regional_coordinator',
]);
export type MembershipRole = z.infer<typeof membershipRole>;

export const latitude = z.coerce.number().min(-90).max(90);
export const longitude = z.coerce.number().min(-180).max(180);
