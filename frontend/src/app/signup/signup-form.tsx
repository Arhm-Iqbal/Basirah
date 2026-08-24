'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { AuthDivider } from '@/components/auth-divider';
import { AuthShell } from '@/components/auth-shell';
import { GoogleIcon } from '@/components/google-icon';
import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { signInWithGoogle } from '@/lib/supabase/oauth';

const hasSupabaseConfig = isSupabaseConfigured();

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    if (!hasSupabaseConfig) {
      setError('Sign-in is not configured for this deployment yet.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not start Google sign-in.');
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (event: FormEvent) => {
    event.preventDefault();

    if (!hasSupabaseConfig) {
      setError('Sign-in is not configured for this deployment yet.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/app` },
      });

      if (error) {
        setError(error.message);
      } else if (data.session) {
        window.location.replace('/app');
        return;
      } else {
        setMessage('Check your email to confirm your account.');
      }
    } catch {
      setError('Could not reach the sign-in service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <Link href="/" aria-label="Basirah home" className="mx-auto flex w-full justify-center">
        <Logo className="h-20 w-auto sm:h-24" priority />
      </Link>

      <h1 className="mt-6 text-3xl text-basirah-teal">Create an account</h1>
      <p className="mt-2 text-base text-basirah-teal">
        You&apos;ll get reports and alerts for the mosques you add.
      </p>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="mt-8 flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-basirah-teal/20 bg-white/45 px-6 py-3 text-sm font-semibold text-basirah-teal transition-colors hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleIcon />
        Sign up with Google
      </button>

      <AuthDivider />

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="text-xs font-medium text-basirah-teal">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-basirah-teal/20 bg-white/70 px-3.5 py-2.5 text-sm text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] motion-reduce:transition-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs font-medium text-basirah-teal">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 w-full rounded-md border border-basirah-teal/20 bg-white/70 px-3.5 py-2.5 text-sm text-basirah-teal outline-none transition-[border-color,box-shadow] duration-150 focus:border-basirah-teal focus:shadow-[0_0_0_3px_rgb(4_51_52_/_15%)] motion-reduce:transition-none"
          />
          <p className="mt-1.5 text-xs text-basirah-teal/80">At least 8 characters.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-1 flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-basirah-rust px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-basirah-rust/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-basirah-rust">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="mt-4 text-sm text-basirah-teal">
          {message}
        </p>
      )}

      {!hasSupabaseConfig && !error && (
        <p className="mt-4 text-xs text-basirah-teal/80">
          Supabase isn&apos;t configured in this environment yet.
        </p>
      )}

      <Link
        href="/report"
        className="mt-4 flex min-h-11 w-full items-center justify-center rounded-full border border-basirah-teal/25 px-6 py-3 text-sm font-semibold text-basirah-teal transition-colors duration-150 hover:border-basirah-teal/40 hover:bg-white/40 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        File a report without an account
      </Link>

      <p className="mt-6 text-center text-sm text-basirah-teal">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-semibold text-basirah-rust transition-colors hover:text-basirah-rust/80"
        >
          Log in
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-basirah-teal/80">
        Reports stay with your mosque until someone verifies them.
      </p>
    </AuthShell>
  );
}
