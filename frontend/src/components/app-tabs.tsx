'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';

const TABS = [
  { href: '/app/map', label: 'Map', shortLabel: 'Map' },
  { href: '/app/report', label: 'Report', shortLabel: 'Report' },
  { href: '/app/reports', label: 'My Reports', shortLabel: 'Reports' },
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
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/app" aria-label="Basirah app home">
            <Logo className="h-7 w-auto" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[10rem] truncate text-xs text-basirah-teal/50 md:inline">
              {email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="cursor-pointer text-sm font-medium text-basirah-teal/70 transition-colors hover:text-basirah-rust"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:px-4 ${
                  active
                    ? 'bg-basirah-teal text-white'
                    : 'text-basirah-teal/70 hover:bg-basirah-teal/5 hover:text-basirah-teal'
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
