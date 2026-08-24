import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional();

const directorySubmissionBase = z.object({
  name: z.string().trim().min(2).max(200),
  address: optionalText(300),
  website: z.string().trim().url().max(300).optional(),
  evidence: z.string().trim().min(10).max(800),
  notes: optionalText(1000),
});

const professionalFields = {
  role: z.string().trim().min(2).max(160),
  specialty: z.string().trim().min(2).max(500),
  organization: optionalText(200),
  public_email: z.string().trim().email().max(254).optional(),
};

// A submission mirrors the fields in the curated directory. It is deliberately a
// discriminated union so business-only and professional-only fields cannot be confused
// at either the form or API boundary.
export const directorySubmissionCreate = z.discriminatedUnion('listing_type', [
  directorySubmissionBase.extend({
    listing_type: z.literal('business'),
    category: z.string().trim().min(2).max(160),
  }),
  directorySubmissionBase.extend({
    listing_type: z.literal('health_professional'),
    ...professionalFields,
  }),
  directorySubmissionBase.extend({
    listing_type: z.literal('lawyer'),
    ...professionalFields,
  }),
]);

export type DirectorySubmissionCreate = z.infer<typeof directorySubmissionCreate>;
