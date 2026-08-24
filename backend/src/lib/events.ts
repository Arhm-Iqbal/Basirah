import type { SupabaseClient } from '@supabase/supabase-js';

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
