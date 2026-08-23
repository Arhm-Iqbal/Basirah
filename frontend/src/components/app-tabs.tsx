'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

const TABS = [
  { href: '/app/map', label: 'Map' },
  { href: '/app/report', label: 'Report' },
  { href: '/app/reports', label: 'My Reports' },
];

export function AppTabs({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-basirah-teal/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight text-basirah-teal">
          Basirah
        </Link>

        <nav className="flex items-center gap-1">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-basirah-teal text-white'
                    : 'text-basirah-teal/70 hover:bg-basirah-teal/5 hover:text-basirah-teal'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-basirah-teal/50 sm:inline">{email}</span>
          <button
            type="button"
            onClick={signOut}
            className="cursor-pointer text-sm font-medium text-basirah-teal/70 transition-colors hover:text-basirah-rust"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
