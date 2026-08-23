import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { createClient } from '@/lib/supabase/server';

import LoginForm from './login-form';

export const metadata = { title: 'Log in · Basirah' };

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/app');
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
