'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { AuthDivider } from '@/components/auth-divider';
import { GoogleIcon } from '@/components/google-icon';
import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleEmailLogin = async (event: FormEvent) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setError('Supabase isn’t configured yet — add the keys to frontend/.env.local.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Could not reach Supabase. Check frontend/.env.local.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-basirah-teal px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <Link href="/" aria-label="Basirah home">
          <Logo className="h-10 w-auto" />
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
          Continue with Google
        </button>

        <AuthDivider />

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text-xs font-medium text-basirah-teal/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-basirah-teal/15 px-3.5 py-2.5 text-sm text-basirah-teal outline-none focus:border-basirah-rust"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium text-basirah-teal/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-basirah-teal/15 px-3.5 py-2.5 text-sm text-basirah-teal outline-none focus:border-basirah-rust"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 flex w-full cursor-pointer items-center justify-center rounded-full bg-basirah-rust px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-basirah-rust/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-basirah-rust">{error}</p>}

        {!isSupabaseConfigured && !error && (
          <p className="mt-4 text-xs text-basirah-teal/50">
            Supabase isn&apos;t configured in this environment yet.
          </p>
        )}

        <Link
          href="/report"
          className="mt-6 block text-center text-sm font-medium text-basirah-teal/70 transition-colors hover:text-basirah-rust"
        >
          Continue as guest →
        </Link>

        <p className="mt-6 text-center text-sm text-basirah-teal/70">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-basirah-rust transition-colors hover:text-basirah-rust/80"
          >
            Sign up
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-basirah-teal/50">
          By continuing you agree to Basirah&apos;s community guidelines.
        </p>
      </div>
    </main>
  );
}
