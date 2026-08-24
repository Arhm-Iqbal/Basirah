import Anthropic from '@anthropic-ai/sdk';
import type { Bindings } from './env';

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

export function buildContext(incident: Record<string, any>, province: string | null): GuidanceContext {
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

Give practical next steps for their situation. Ground everything in Canadian context: police non-emergency reporting, provincial victim services, the Canadian Human Rights Commission or the relevant provincial human rights tribunal, and community legal clinics.

Rules:
- Address the reporter directly and plainly. No preamble, no restating what they told you.
- Never speculate about who was responsible or their background. Reason about the situation, not the people.
- Do not invent phone numbers, case numbers, URLs, or organisation names you are not certain exist in Canada. Describe the type of service instead.
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
        },
        required: ['title', 'detail'],
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
  steps: { title: string; detail: string }[];
  note: string;
};

export async function generateGuidance(
  env: Bindings,
  context: GuidanceContext,
): Promise<Guidance> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    system: SYSTEM,
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
    messages: [{ role: 'user', content: JSON.stringify(context) }],
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('No guidance returned.');
  return JSON.parse(block.text) as Guidance;
}
