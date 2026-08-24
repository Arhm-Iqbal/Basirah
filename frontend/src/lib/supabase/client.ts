import { createBrowserClient } from '@supabase/ssr';
import { getSupabasePublicConfig } from '@/lib/supabase/config';

export function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error('Sign-in is not configured for this deployment yet.');
  }

  return createBrowserClient(config.url, config.anonKey);
}

export function createOptionalClient() {
  const config = getSupabasePublicConfig();
  return config ? createBrowserClient(config.url, config.anonKey) : null;
}
