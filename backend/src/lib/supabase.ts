import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Bindings } from './env';

// Service role bypasses RLS entirely. This client must never be constructed anywhere
// that could reach the browser, and its key must never be echoed in a response.
export function serviceClient(env: Bindings): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
