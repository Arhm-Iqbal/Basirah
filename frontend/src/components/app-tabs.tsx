'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';

type Tab = { href: string; label: string; shortLabel: string; icon: React.ReactNode };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const TABS: Tab[] = [
  {
    href: '/app/profile',
    label: 'Profile',
    shortLabel: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <circle cx="12" cy="8" r="3.5" {...stroke} />
        <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0" {...stroke} />
      </svg>
    ),
  },
  {
    href: '/app/map',
    label: 'Map',
    shortLabel: 'Map',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" {...stroke} />
        <circle cx="12" cy="10.5" r="2.25" {...stroke} />
      </svg>
    ),
  },
  {
    href: '/app/report',
    label: 'Report',
    shortLabel: 'Report',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <path d="M12 4.5 21 19.5H3L12 4.5Z" {...stroke} />
        <path d="M12 10v4" {...stroke} />
        <circle cx="12" cy="16.75" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/app/reports',
    label: 'My Reports',
    shortLabel: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <path d="M6 3.5h9L19 8v12.5H6V3.5Z" {...stroke} />
        <path d="M14.5 3.5V8H19M9 12.5h6M9 16h4" {...stroke} />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppTabs({ email }: { email: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-basirah-teal/10 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/app"
              aria-label="Basirah app home"
              className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-basirah-teal"
            >
              <Logo className="h-10 w-auto sm:h-11" />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {TABS.map((tab) => {
                const active = isActive(pathname, tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-medium tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal ${
                      active
                        ? 'bg-basirah-teal text-white'
                        : 'text-basirah-teal/65 hover:bg-basirah-teal/5 hover:text-basirah-teal'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden max-w-[12rem] truncate text-xs text-basirah-teal/45 lg:inline">
                {email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="cursor-pointer rounded-full px-2 py-1 text-sm font-medium text-basirah-teal/65 transition-colors duration-150 hover:text-basirah-rust focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom bar is fixed on mobile, so every page inside the app shell needs matching
          bottom padding. That lives on the shell, not here. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-basirah-teal/10 bg-white/95 backdrop-blur md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto flex max-w-md items-stretch">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[0.6875rem] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-basirah-teal ${
                    active ? 'text-basirah-teal' : 'text-basirah-teal/45'
                  }`}
                >
                  <span className={active ? '' : 'opacity-80'}>{tab.icon}</span>
                  {tab.shortLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
