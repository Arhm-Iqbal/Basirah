'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';

type Tab = { href: string; label: string; shortLabel: string; icon: React.ReactNode };

const TABS: Tab[] = [
  {
    href: '/app/profile',
    label: 'Profile',
    shortLabel: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-basirah-teal">
        <circle cx="12" cy="7.5" r="3.9" />
        <path d="M12 13c-4.2 0-7.5 2.6-7.5 5.9 0 .9.7 1.6 1.6 1.6h11.8c.9 0 1.6-.7 1.6-1.6C19.5 15.6 16.2 13 12 13Z" />
      </svg>
    ),
  },
  {
    href: '/app/map',
    label: 'Map',
    shortLabel: 'Map',
    icon: <img src="/icons/masjid-pin.png" alt="" width={16} height={20} className="h-5 w-auto" />,
  },
  {
    href: '/app/report',
    label: 'Report',
    shortLabel: 'Report',
    icon: <img src="/icons/report.png" alt="" width={18} height={20} className="h-5 w-auto" />,
  },
  {
    href: '/app/reports',
    label: 'My Reports',
    shortLabel: 'Reports',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-basirah-teal">
        <rect x="3.5" y="5" width="17" height="2.6" rx="1.3" />
        <rect x="3.5" y="10.7" width="17" height="2.6" rx="1.3" />
        <rect x="3.5" y="16.4" width="11" height="2.6" rx="1.3" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppTabs() {
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

            <button
              type="button"
              onClick={signOut}
              className="cursor-pointer rounded-full px-2 py-1 text-sm font-medium text-basirah-teal/65 transition-colors duration-150 hover:text-basirah-rust focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
            >
              Sign out
            </button>
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
                  <span className={active ? 'opacity-100' : 'opacity-45'}>{tab.icon}</span>
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
