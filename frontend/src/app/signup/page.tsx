import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import SignUpForm from './signup-form';

export const metadata: Metadata = { title: 'Sign up · Basirah' };

export default async function SignUpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/app');
  }

  return <SignUpForm />;
}
