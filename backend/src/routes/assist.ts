import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env } from '../lib/env';
import { requireAuth } from '../lib/auth';
import { fail, zodFail } from '../lib/errors';

export const assist = new Hono<Env>();

assist.use('*', requireAuth);

const rewriteBody = z.object({
  text: z.string().min(20).max(6000),
});

// The reporter's account is evidence. This tidies how it reads and must not touch what it
// says, so the prompt is a list of prohibitions rather than an invitation to improve.
const SYSTEM = `You copy-edit a person's account of a hate incident they are reporting. You are not rewriting it, summarising it, or improving the story.

Fix only: spelling, grammar, punctuation, run-on sentences, and paragraph breaks.

You must not:
- Add any detail that is not in the original, including times, places, counts, or quotes.
- Remove any detail that is in the original, however minor.
- Change what is asserted, or soften, strengthen, or dramatise it.
- Add description of anyone's appearance, race, ethnicity, religion, nationality, accent, or clothing. If the original contains such description, keep it exactly as written -- do not expand on it and do not remove it.
- Change first person to third person, or change the writer's voice.
- Add opinions, conclusions, or legal characterisations such as "assault" or "hate crime".
- Add a preamble, a heading, or any commentary.

If the text is already clear, return it unchanged. Return only the corrected text.`;

assist.post(
  '/rewrite',
  zValidator('json', rewriteBody, (r, c) => (r.success ? undefined : zodFail(c, r.error.issues))),
  async (c) => {
    if (!c.env.OPENAI_API_KEY) {
      return fail(c, 503, 'assist_unavailable', 'Writing help is not configured on this server.');
    }

    const { text } = c.req.valid('json');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: text },
        ],
      }),
    });

    if (!res.ok) {
      console.error('rewrite failed', res.status, await res.text().catch(() => ''));
      return fail(c, 502, 'assist_failed', 'Could not tidy that up right now.');
    }

    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const rewritten = body.choices?.[0]?.message?.content?.trim();
    if (!rewritten) return fail(c, 502, 'assist_failed', 'Could not tidy that up right now.');

    // A copy-edit cannot legitimately halve or double the text. A length swing that large
    // means content was dropped or invented, so the original is returned untouched rather
    // than offering the reporter something that no longer matches what happened.
    const ratio = rewritten.length / text.length;
    if (ratio < 0.6 || ratio > 1.8) {
      console.error('rewrite rejected on length', { from: text.length, to: rewritten.length });
      return fail(
        c,
        502,
        'assist_rejected',
        'The suggestion changed too much of your text, so it was discarded. Your wording is unchanged.',
      );
    }

    return c.json({ original: text, rewritten });
  },
);
