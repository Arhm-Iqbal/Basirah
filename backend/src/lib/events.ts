import Anthropic from '@anthropic-ai/sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Bindings } from './env';

export type ParsedEvent = {
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  url: string | null;
  source_ref: string;
};

// DTSTART:20260901T183000Z, DTSTART;TZID=...:20260901T183000, DTSTART;VALUE=DATE:20260901
function icsDate(value: string): string | null {
  const v = value.trim();
  const date = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (date) return `${date[1]}-${date[2]}-${date[3]}T00:00:00.000Z`;

  const stamp = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(v);
  if (!stamp) return null;
  const [, y, mo, d, h, mi, s, z] = stamp;
  // A local-time DTSTART with no TZID is treated as UTC. Guessing a zone would be worse
  // than being consistently off for the handful of feeds that omit it.
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.000${z ? 'Z' : 'Z'}`;
}

function unfold(text: string): string[] {
  // RFC 5545 folds long lines with a leading space or tab on the continuation.
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n[ \t]/g, '')
    .split('\n');
}

function unescape(v: string): string {
  return v.replace(/\\n/gi, '\n').replace(/\\,/g, ',').replace(/\;/g, ';').replace(/\\\\/g, '\\');
}

export function parseIcs(text: string): ParsedEvent[] {
  const out: ParsedEvent[] = [];
  let cur: Record<string, string> | null = null;

  for (const line of unfold(text)) {
    if (line.startsWith('BEGIN:VEVENT')) {
      cur = {};
      continue;
    }
    if (line.startsWith('END:VEVENT')) {
      if (cur) {
        const start = cur.DTSTART ? icsDate(cur.DTSTART) : null;
        if (start && cur.SUMMARY) {
          out.push({
            title: unescape(cur.SUMMARY).slice(0, 300),
            description: cur.DESCRIPTION ? unescape(cur.DESCRIPTION).slice(0, 2000) : null,
            starts_at: start,
            ends_at: cur.DTEND ? icsDate(cur.DTEND) : null,
            url: cur.URL ?? null,
            source_ref: cur.UID ?? `${start}-${cur.SUMMARY}`.slice(0, 200),
          });
        }
      }
      cur = null;
      continue;
    }
    if (!cur) continue;

    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const rawKey = line.slice(0, sep);
    const key = rawKey.split(';')[0].toUpperCase();
    cur[key] = line.slice(sep + 1);
  }

  return out;
}

export async function upsertEvents(
  db: SupabaseClient,
  mosqueId: string,
  events: ParsedEvent[],
  source: 'ics' | 'scraped' | 'admin',
): Promise<number> {
  if (events.length === 0) return 0;
  const rows = events.map((e) => ({ ...e, mosque_id: mosqueId, source }));
  const { error } = await db
    .from('mosque_events')
    .upsert(rows, { onConflict: 'mosque_id,source_ref' });
  if (error) throw new Error(error.message);
  return rows.length;
}

// Most Canadian mosque event listings live on Facebook and Instagram, which cannot be read
// for Pages we do not own. ICS covers the minority who publish a feed; the admin-entered
// tier below is what actually carries coverage.
export async function ingestFromWebsite(db: SupabaseClient, mosqueId: string, website: string) {
  const candidates = [
    website.replace(/\/+$/, '') + '/events.ics',
    website.replace(/\/+$/, '') + '/?ical=1',
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { headers: { Accept: 'text/calendar' } });
      if (!res.ok) continue;
      const body = await res.text();
      if (!body.includes('BEGIN:VEVENT')) continue;
      return await upsertEvents(db, mosqueId, parseIcs(body), 'ics');
    } catch {
      // A mosque website being down is not an ingestion failure worth aborting the batch.
    }
  }
  return 0;
}

const EVENT_PAGES = ['/events', '/events/', '/programs', '/calendar', '/whats-on', ''];

// Scripts and styles first, then tags. Done in that order because stripping tags first
// would leave the contents of <script> behind as text.
function toText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12_000);
}

const EVENT_SCHEMA = {
  type: 'object',
  properties: {
    events: {
      type: 'array',
      maxItems: 15,
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: ['string', 'null'] },
          starts_at: { type: 'string' },
          ends_at: { type: ['string', 'null'] },
        },
        required: ['title', 'starts_at', 'ends_at', 'description'],
        additionalProperties: false,
      },
    },
  },
  required: ['events'],
  additionalProperties: false,
} as const;

const SYSTEM = `You extract upcoming events from the text of a mosque's website.

Rules:
- Only include events with a date you can actually determine. If the page says "every Friday" with no date, skip it -- a recurring prayer time is not an event.
- starts_at and ends_at must be ISO 8601 with an offset. Use the year given; if none is given, assume the next occurrence from today.
- Do not invent events, times, or descriptions. An empty list is the correct answer for a page that has none.
- Skip anything already past.`;

// Returns [] rather than throwing when the key is unset, so ingestion degrades to the ICS
// and admin tiers instead of failing.
export async function extractEventsFromHtml(
  env: Bindings,
  html: string,
  mosqueName: string,
): Promise<ParsedEvent[]> {
  if (!env.ANTHROPIC_API_KEY) return [];

  const text = toText(html);
  if (text.length < 200) return [];

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    system: SYSTEM,
    output_config: { format: { type: 'json_schema', schema: EVENT_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: `Today is ${new Date().toISOString().slice(0, 10)}.\nMosque: ${mosqueName}\n\n${text}`,
      },
    ],
  });

  const block = response.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') return [];

  const parsed = JSON.parse(block.text) as {
    events: {
      title: string;
      description: string | null;
      starts_at: string;
      ends_at: string | null;
    }[];
  };

  return parsed.events.flatMap((e) => {
    const start = Date.parse(e.starts_at);
    if (Number.isNaN(start)) return [];
    return [
      {
        title: e.title.slice(0, 300),
        description: e.description ? e.description.slice(0, 2000) : null,
        starts_at: new Date(start).toISOString(),
        ends_at:
          e.ends_at && !Number.isNaN(Date.parse(e.ends_at))
            ? new Date(e.ends_at).toISOString()
            : null,
        url: null,
        source_ref: `scraped-${e.title}-${e.starts_at}`.slice(0, 200),
      },
    ];
  });
}

export async function ingestFromWebsiteDeep(
  db: SupabaseClient,
  env: Bindings,
  mosqueId: string,
  mosqueName: string,
  website: string,
): Promise<{ ics: number; scraped: number }> {
  const ics = await ingestFromWebsite(db, mosqueId, website);
  if (ics > 0) return { ics, scraped: 0 };

  const base = website.replace(/\/+$/, '');
  for (const path of EVENT_PAGES) {
    try {
      const res = await fetch(base + path, {
        headers: {
          'User-Agent': 'basirah/0.1 (community mosque directory; contact@basirah.ca)',
          Accept: 'text/html',
        },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const events = await extractEventsFromHtml(env, html, mosqueName);
      if (events.length > 0)
        return { ics: 0, scraped: await upsertEvents(db, mosqueId, events, 'scraped') };
    } catch {
      // A site being down, blocked, or JS-rendered is expected for a good share of these;
      // it must not abort the batch.
    }
  }
  return { ics: 0, scraped: 0 };
}
