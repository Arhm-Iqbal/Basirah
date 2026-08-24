import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { safeAuthNextPath } from '@/lib/supabase/auth-path';
import { getCurrentUser } from '@/lib/supabase/server';

import SignUpForm from './signup-form';

export const metadata: Metadata = { title: 'Sign up · Basirah' };
export const dynamic = 'force-dynamic';

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeAuthNextPath(next ?? null);
  const user = await getCurrentUser();

  if (user) {
    redirect(nextPath);
  }

  return <SignUpForm nextPath={nextPath} />;
}
