import type { Bindings } from './env';

const VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// Returns false when the secret is configured and the token fails. When no secret is
// configured at all the check is skipped, which is only tolerable in local dev -- the
// production Worker must have TURNSTILE_SECRET_KEY set or the anonymous endpoints are
// left open to automated submission.
export async function verifyTurnstile(env: Bindings, token: string): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true;

  try {
    const res = await fetch(VERIFY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: token }),
    });
    if (!res.ok) return false;

    const body = (await res.json()) as { success?: boolean };
    return body.success === true;
  } catch (error) {
    console.error('turnstile verification failed', error);
    return false;
  }
}
