import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/supabase/server';

import SignUpForm from './signup-form';

export const metadata: Metadata = { title: 'Sign up · Basirah' };

export default async function SignUpPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect('/app');
  }

  return <SignUpForm />;
}
