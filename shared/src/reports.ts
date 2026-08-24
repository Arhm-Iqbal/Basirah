import { z } from 'zod';
import {
  incidentCategory,
  incidentStatus,
  isoTimestamp,
  latitude,
  longitude,
  uuid,
} from './common';
import { incidentActionPlan } from './actions';

// No race, ethnicity, religion, clothing, or physical-description field exists on any
// report shape, and none may be added. Describe what a person did, never how they looked.
// details is the escape hatch for form fields that have not stabilized -- it is not a
// bypass for that rule.
const reportBase = z.object({
  mosque_id: uuid.nullish(),
  category: incidentCategory.optional(),
  occurred_at: isoTimestamp.optional(),
  description: z.string().min(1).max(10_000),
  details: z.record(z.unknown()).default({}),
});

export const onlineReport = reportBase.extend({
  channel: z.literal('online'),
  platform: z.string().max(100).optional(),
  url: z.string().url().max(2000).optional(),
});

export const inPersonReport = reportBase.extend({
  channel: z.literal('in_person'),
  lat: latitude.optional(),
  lng: longitude.optional(),
  location_description: z.string().max(500).optional(),
});

export const reportInput = z.discriminatedUnion('channel', [onlineReport, inPersonReport]);
export type ReportInput = z.infer<typeof reportInput>;

export const incidentCreate = reportInput;
export type IncidentCreate = z.infer<typeof incidentCreate>;

export const incident = z.object({
  id: uuid,
  reporter_id: uuid,
  mosque_id: uuid.nullable(),
  channel: z.enum(['online', 'in_person']),
  category: incidentCategory.nullable(),
  status: incidentStatus,
  occurred_at: isoTimestamp.nullable(),
  description: z.string().nullable(),
  details: z.record(z.unknown()),
  created_at: isoTimestamp,
  updated_at: isoTimestamp,
});
export type Incident = z.infer<typeof incident>;

// Anonymous path. There is no reporter field to send and no session to attach; the
// Turnstile token is the only thing standing between this endpoint and a spam firehose.
export const tipCreate = z.intersection(
  reportInput,
  z.object({ turnstile_token: z.string().min(1) }),
);
export type TipCreate = z.infer<typeof tipCreate>;

// The claim code is returned exactly once, in this response, and is never recoverable.
// Only its hash is stored.
export const tipCreated = z.object({
  id: uuid,
  claim_code: z.string(),
  status: incidentStatus,
  created_at: isoTimestamp,
  actions: incidentActionPlan,
});
export type TipCreated = z.infer<typeof tipCreated>;

export const tipStatusQuery = z.object({ claim_code: z.string().min(1) });

export const tipStatus = z.object({
  status: incidentStatus,
  created_at: isoTimestamp,
  updated_at: isoTimestamp,
});
export type TipStatus = z.infer<typeof tipStatus>;
