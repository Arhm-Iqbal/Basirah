import { redirect } from 'next/navigation';

import { AppTabs } from '@/components/app-tabs';
import { getCurrentUser } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  return (
    <div className="relative isolate flex min-h-dvh flex-col bg-basirah-cream">
      <div aria-hidden className="user-pages-bg" />
      <AppTabs />
      <main className="relative z-10 flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
}
