import { z } from 'zod';

export const actionLink = z.object({
  label: z.string(),
  url: z.string().url(),
});
export type ActionLink = z.infer<typeof actionLink>;

export const actionStep = z.object({
  title: z.string(),
  detail: z.string(),
  link: actionLink.optional(),
});
export type ActionStep = z.infer<typeof actionStep>;

export const incidentActionPlan = z.object({
  channel: z.enum(['online', 'in_person']),
  urgency: z.enum(['routine', 'elevated', 'urgent']),
  heading: z.string(),
  summary: z.string(),
  steps: z.array(actionStep).min(2).max(6),
  note: z.string(),
});
export type IncidentActionPlan = z.infer<typeof incidentActionPlan>;
