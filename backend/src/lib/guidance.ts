import type { Bindings } from './env';
import { findResources, type SupportResource } from './resources';
import { serviceClient } from './supabase';

// What the model is allowed to see.
//
// This is an allowlist, not a denylist, and that is deliberate: the report form will grow
// fields, and a denylist silently leaks every field someone forgets to add to it. Anything
// not named here never reaches the API.
//
// Never added to this list: reporter_name, reporter_email, reporter_phone,
// location_address, online_account, online_url, existing_reference. Those identify the
// reporter, the exact place they were, or the account they were targeted from.
const ALLOWED_DETAIL_KEYS = [
  'still_happening',
  'threats',
  'weapon',
  'witnesses',
  'reported_elsewhere',
  'support_needed',
  'reporting_for',
  'duration',
] as const;

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/g;
const URL = /\bhttps?:\/\/\S+/gi;
const POSTAL = /\b[A-Z]\d[A-Z][ -]?\d[A-Z]\d\b/gi;

// The reporter writes freely and will sometimes name people, paste a handle, or include
// their own number. Scrubbing is a floor, not a guarantee -- it cannot catch a plain name --
// which is why the prompt also tells the model to reason about the situation, not the people.
export function scrub(text: string): string {
  return text
    .replace(EMAIL, '[email removed]')
    .replace(URL, '[link removed]')
    .replace(POSTAL, '[postal code removed]')
    .replace(PHONE, '[number removed]')
    .slice(0, 4000);
}

export type GuidanceContext = {
  channel: string;
  category: string | null;
  province: string | null;
  summary: string;
  facts: Record<string, unknown>;
};

export function buildContext(
  incident: Record<string, any>,
  province: string | null,
): GuidanceContext {
  const details = (incident.details ?? {}) as Record<string, unknown>;
  const facts: Record<string, unknown> = {};

  for (const key of ALLOWED_DETAIL_KEYS) {
    const value = details[key];
    if (typeof value === 'string' && value.trim() !== '') facts[key] = scrub(value);
  }

  return {
    channel: incident.channel,
    category: incident.category ?? null,
    province,
    summary: scrub(incident.description ?? ''),
    facts,
  };
}

const SYSTEM = `You advise people in Canada who have just reported an anti-Muslim hate incident to a community safety organisation.

Give practical next steps for their situation, drawing on the resources supplied in the "resources" field of the user message.

The supplied resources are the ONLY permitted source of organisation names, phone numbers, and URLs. This is absolute:
- Never name an organisation that is not in the supplied list. Not one you know of, not one that probably exists, not one under a slightly different name.
- Never state a phone number or URL that is not written in the supplied list, character for character. Do not complete, correct, reformat, or recall a contact from your own knowledge.
- Where a supplied resource has a null phone or url, that is deliberate and means the contact could not be verified. Say what the resource's description says about reaching them. Never fill the gap with a number or address of your own.
- When a step rests on a supplied resource, set that step's resource_id to that resource's id. Set resource_id to null for a step that names no organisation.
- If the supplied list does not cover what someone in this situation needs, describe the type of service to look for and say how to find it locally. An honest gap is correct; an invented contact is not.

The one exception: you may tell someone to call 911 in an emergency.

Rules:
- Address the reporter directly and plainly. No preamble, no restating what they told you.
- Never speculate about who was responsible or their background. Reason about the situation, not the people.
- Do not invent case numbers, reference numbers, deadlines, or filing time limits.
- If the summary suggests ongoing danger, the first step is contacting emergency services.
- You are not a lawyer and this is not legal advice. Do not claim otherwise.`;

const SCHEMA = {
  type: 'object',
  properties: {
    urgency: { type: 'string', enum: ['routine', 'elevated', 'urgent'] },
    steps: {
      type: 'array',
      minItems: 2,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          detail: { type: 'string' },
          resource_id: {
            type: ['string', 'null'],
            description: 'id of the supplied resource this step draws on, or null.',
          },
        },
        required: ['title', 'detail', 'resource_id'],
        additionalProperties: false,
      },
    },
    note: { type: 'string' },
  },
  required: ['urgency', 'steps', 'note'],
  additionalProperties: false,
} as const;

export type Guidance = {
  urgency: 'routine' | 'elevated' | 'urgent';
  steps: { title: string; detail: string; resource_id: string | null }[];
  note: string;
  resources: SupportResource[];
};

export async function generateGuidance(env: Bindings, context: GuidanceContext): Promise<Guidance> {
  const resources = await findResources(serviceClient(env), context.province, context.category);

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: JSON.stringify({ ...context, resources }) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'incident_guidance', strict: true, schema: SCHEMA },
      },
    }),
  });

  if (!res.ok) {
    console.error('openai guidance failed', res.status, await res.text().catch(() => ''));
    throw new Error('No guidance returned.');
  }

  const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = body.choices?.[0]?.message?.content;
  if (!content) throw new Error('No guidance returned.');

  const parsed = JSON.parse(content) as Guidance;

  // The prompt forbids inventing a citation, but a prompt is not an enforcement mechanism.
  // An id that is not in the candidate set we just supplied gets dropped rather than
  // rendered as a source the reporter can act on.
  const supplied = new Set(resources.map((r) => r.id));

  return {
    urgency: parsed.urgency,
    note: parsed.note,
    steps: (parsed.steps ?? []).map((step) => ({
      title: step.title,
      detail: step.detail,
      resource_id: step.resource_id && supplied.has(step.resource_id) ? step.resource_id : null,
    })),
    resources,
  };
}
