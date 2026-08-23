import { z } from 'zod';
import { isoTimestamp, uuid } from './common';

export const analysisCreate = z
  .object({
    url: z.string().url().max(2000).optional(),
    source_text: z.string().max(50_000).optional(),
    turnstile_token: z.string().optional(),
  })
  .refine((v) => Boolean(v.url ?? v.source_text), {
    message: 'Provide either url or source_text.',
  });
export type AnalysisCreate = z.infer<typeof analysisCreate>;

export const analysisVerdict = z.object({
  is_anti_muslim_hate: z.boolean(),
  confidence: z.number().min(0).max(1),
  severity: z.enum(['none', 'low', 'moderate', 'high', 'severe']),
  rationale: z.string(),
  credible_sources: z.array(
    z.object({ title: z.string(), url: z.string(), publisher: z.string().nullable() }),
  ),
});
export type AnalysisVerdict = z.infer<typeof analysisVerdict>;

export const analysisSubmission = z.object({
  id: uuid,
  url: z.string().nullable(),
  content_type: z.enum(['article', 'video', 'social', 'text']).nullable(),
  status: z.enum(['pending', 'analyzing', 'complete', 'failed']),
  verdict: z.union([analysisVerdict, z.record(z.unknown())]),
  created_at: isoTimestamp,
});
export type AnalysisSubmission = z.infer<typeof analysisSubmission>;
