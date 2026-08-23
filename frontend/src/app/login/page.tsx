'use client';

import Link from 'next/link';
import { useState } from 'react';

import { GoogleIcon } from '@/components/google-icon';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase isn’t configured yet — add the keys to frontend/.env.local.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
    } catch {
      setError('Could not reach Supabase. Check frontend/.env.local.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-basirah-teal px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <Link href="/" className="text-lg font-semibold tracking-tight text-basirah-teal">
          Basirah
        </Link>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight text-basirah-teal">Log in</h1>
        <p className="mt-2 text-sm text-basirah-teal/70">
          Access incident reports, alerts, and your community&apos;s dashboard.
        </p>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="mt-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-basirah-teal/15 px-6 py-3 text-sm font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {isLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {error && <p className="mt-4 text-sm text-basirah-rust">{error}</p>}

        {!isSupabaseConfigured && !error && (
          <p className="mt-4 text-xs text-basirah-teal/50">
            Supabase isn&apos;t configured in this environment yet.
          </p>
        )}

        <p className="mt-8 text-center text-xs text-basirah-teal/50">
          By continuing you agree to Basirah&apos;s community guidelines.
        </p>
      </div>
    </main>
  );
}
