import { Suspense } from 'react';

import { ProfileView } from '@/components/profile-view';
import { getCurrentUser } from '@/lib/supabase/server';

export const metadata = { title: 'Profile · Basirah' };

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <Suspense>
      <ProfileView email={user?.email ?? null} />
    </Suspense>
  );
}
