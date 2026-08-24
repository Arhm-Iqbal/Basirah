import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { getCurrentUser } from '@/lib/supabase/server';
import { safeAuthNextPath } from '@/lib/supabase/auth-path';

import LoginForm from './login-form';

export const metadata = { title: 'Log in · Basirah' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect(safeAuthNextPath(next ?? null));
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
