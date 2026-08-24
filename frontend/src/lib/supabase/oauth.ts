import { createClient } from '@/lib/supabase/client';
import { safeAuthNextPath } from '@/lib/supabase/auth-path';

export async function signInWithGoogle(nextPath = '/app') {
  const supabase = createClient();
  const next = safeAuthNextPath(nextPath);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error('Google sign-in could not start.');
  }

  window.location.replace(data.url);
}
