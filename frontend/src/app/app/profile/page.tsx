import { ProfileView } from '@/components/profile-view';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Profile · Basirah' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ProfileView email={user?.email ?? null} />;
}
