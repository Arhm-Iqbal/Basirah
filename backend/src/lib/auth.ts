import type { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { Env } from './env';
import { fail } from './errors';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
  }
}

export async function requireAuth(c: Context<Env>, next: Next) {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return fail(c, 401, 'unauthenticated', 'Missing bearer token.');
  }

  // Verified with the anon key, not the service role: this call must carry exactly the
  // authority of the caller's own token and nothing more.
  const client = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.getUser(header.slice(7));
  if (error || !data.user) return fail(c, 401, 'unauthenticated', 'Token is invalid or expired.');

  c.set('userId', data.user.id);
  await next();
}
