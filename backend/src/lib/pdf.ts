import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

const TEAL = rgb(0.016, 0.2, 0.204);
const RUST = rgb(0.58, 0.129, 0.024);
const MUTED = rgb(0.42, 0.48, 0.48);

const PAGE = { w: 595.28, h: 841.89 };
const MARGIN = 56;
const WIDTH = PAGE.w - MARGIN * 2;

const LABELS: Record<string, string> = {
  online_platform: 'Platform',
  online_harm: 'Type of online harm',
  online_account: 'Account or handle',
  location_kind: 'Kind of place',
  location_name: 'Place name',
  location_address: 'Address',
  target: 'Who or what was targeted',
  responsible_party: 'What the person or people did',
  timing_note: 'Timing',
  still_happening: 'Still happening',
  duration: 'Duration',
  witnesses: 'Witnesses',
  witness_details: 'Witness details',
  threats: 'Threats made',
  weapon: 'Weapon involved',
  before_context: 'Before',
  after_context: 'After',
  other_details: 'Other details',
  reporting_for: 'Reporting for',
  reported_elsewhere: 'Reported elsewhere',
  existing_reference: 'Existing reference',
  support_needed: 'Support needed',
  anything_else: 'Anything else',
  reporter_name: 'Name',
  reporter_email: 'Email',
  reporter_phone: 'Phone',
};

const CONTACT_KEYS = new Set(['reporter_name', 'reporter_email', 'reporter_phone']);

type Ctx = { doc: PDFDocument; page: PDFPage; y: number; body: PDFFont; bold: PDFFont };

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([PAGE.w, PAGE.h]);
  ctx.y = PAGE.h - MARGIN;
}

function room(ctx: Ctx, needed: number) {
  if (ctx.y - needed < MARGIN) newPage(ctx);
}

// pdf-lib has no text layout, so wrapping is ours to do. Measuring per word rather than
// estimating from character counts keeps proportional fonts from overflowing the margin.
function wrap(text: string, font: PDFFont, size: number, max: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (paragraph.trim() === '') {
      out.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line === '' ? word : `${line} ${word}`;
      if (font.widthOfTextAtSize(candidate, size) > max && line !== '') {
        out.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    out.push(line);
  }
  return out;
}

function text(
  ctx: Ctx,
  value: string,
  opts: { size?: number; font?: PDFFont; color?: typeof TEAL; gap?: number } = {},
) {
  const size = opts.size ?? 10.5;
  const font = opts.font ?? ctx.body;
  const lines = wrap(value, font, size, WIDTH);
  const lh = size * 1.45;
  for (const line of lines) {
    room(ctx, lh);
    ctx.page.drawText(line, { x: MARGIN, y: ctx.y - size, size, font, color: opts.color ?? TEAL });
    ctx.y -= lh;
  }
  ctx.y -= opts.gap ?? 0;
}

function rule(ctx: Ctx) {
  room(ctx, 14);
  ctx.y -= 6;
  ctx.page.drawLine({
    start: { x: MARGIN, y: ctx.y },
    end: { x: PAGE.w - MARGIN, y: ctx.y },
    thickness: 0.5,
    color: rgb(0.85, 0.87, 0.86),
  });
  ctx.y -= 14;
}

function when(iso: string | null): string {
  if (!iso) return 'Not recorded';
  return new Date(iso).toLocaleString('en-CA', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  });
}

export type ReportPdfInput = {
  id: string;
  channel: string;
  category: string | null;
  status: string;
  description: string | null;
  occurred_at: string | null;
  created_at: string;
  details: Record<string, unknown>;
  mosque_name?: string | null;
};

export async function buildReportPdf(incident: ReportPdfInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Basirah incident report ${incident.id}`);
  doc.setProducer('Basirah');

  const body = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ctx: Ctx = { doc, page: doc.addPage([PAGE.w, PAGE.h]), y: PAGE.h - MARGIN, body, bold };

  text(ctx, 'BASIRAH', { size: 9, font: bold, color: RUST });
  ctx.y -= 4;
  text(ctx, 'Incident report', { size: 22, font: bold });
  text(ctx, `Reference ${incident.id}`, { size: 9, color: MUTED });
  text(ctx, `Generated ${when(new Date().toISOString())} UTC`, { size: 9, color: MUTED });
  rule(ctx);

  const summary: [string, string][] = [
    ['Where', incident.channel === 'online' ? 'Online' : 'In person'],
    ['Category', incident.category ? incident.category.replace(/_/g, ' ') : 'Not categorised'],
    ['Status', incident.status.replace(/_/g, ' ')],
    ['Occurred', when(incident.occurred_at)],
    ['Filed', when(incident.created_at)],
  ];
  if (incident.mosque_name) summary.push(['Mosque', incident.mosque_name]);

  for (const [label, value] of summary) {
    room(ctx, 15);
    ctx.page.drawText(label, { x: MARGIN, y: ctx.y - 10, size: 9, font: bold, color: MUTED });
    ctx.page.drawText(value, { x: MARGIN + 110, y: ctx.y - 10, size: 10, font: body, color: TEAL });
    ctx.y -= 15;
  }

  rule(ctx);
  text(ctx, 'What happened', { size: 13, font: bold, gap: 6 });
  text(ctx, incident.description?.trim() || 'No description recorded.', { gap: 8 });

  const detailRows = Object.entries(incident.details)
    .filter(
      ([k, v]) => k in LABELS && !CONTACT_KEYS.has(k) && typeof v === 'string' && v.trim() !== '',
    )
    .map(([k, v]) => [LABELS[k], (v as string).trim()] as const);

  if (detailRows.length > 0) {
    rule(ctx);
    text(ctx, 'Details', { size: 13, font: bold, gap: 6 });
    for (const [label, value] of detailRows) {
      text(ctx, label, { size: 9, font: bold, color: MUTED });
      text(ctx, value, { gap: 6 });
    }
  }

  const contact = Object.entries(incident.details).filter(
    ([k, v]) => CONTACT_KEYS.has(k) && typeof v === 'string' && v.trim() !== '',
  );
  if (contact.length > 0) {
    rule(ctx);
    text(ctx, 'Your contact details', { size: 13, font: bold, gap: 4 });
    text(
      ctx,
      'Included because this is your own copy. Remove this page before sharing the report if you do not want it passed on.',
      {
        size: 9,
        color: MUTED,
        gap: 6,
      },
    );
    for (const [k, v] of contact) {
      text(ctx, LABELS[k], { size: 9, font: bold, color: MUTED });
      text(ctx, (v as string).trim(), { gap: 6 });
    }
  }

  rule(ctx);
  text(
    ctx,
    'Basirah stores this report so your community can review and verify it. It is not automatically sent to police or any other authority. Nothing is shared as a community-wide alert until a person has verified it.',
    { size: 8.5, color: MUTED },
  );

  return doc.save();
}
