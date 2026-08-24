import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabasePublicConfig } from '@/lib/supabase/config';

export async function createClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error('Supabase authentication is not configured for this deployment.');
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component. Middleware refreshes the session.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  if (!getSupabasePublicConfig()) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Supabase user lookup failed.', error);
    return null;
  }
}
