import { redirect } from 'next/navigation';

import { AppTabs } from '@/components/app-tabs';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen flex-col bg-basirah-cream">
      <AppTabs />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}
