'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Logo } from '@/components/logo';
import { createClient } from '@/lib/supabase/client';

type Tab = { href: string; label: string; shortLabel: string; icon: React.ReactNode };

const TABS: Tab[] = [
  {
    href: '/app/map',
    label: 'My community',
    shortLabel: 'Community',
    icon: <img src="/icons/masjid-pin.png" alt="" width={16} height={20} className="h-5 w-auto" />,
  },
  {
    href: '/app/report',
    label: 'Report',
    shortLabel: 'Report',
    icon: <img src="/icons/report.png" alt="" width={18} height={20} className="h-5 w-auto" />,
  },
];

function ProfileIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`${className} fill-current`}>
      <circle cx="12" cy="7.5" r="3.9" />
      <path d="M12 13c-4.2 0-7.5 2.6-7.5 5.9 0 .9.7 1.6 1.6 1.6h11.8c.9 0 1.6-.7 1.6-1.6C19.5 15.6 16.2 13 12 13Z" />
    </svg>
  );
}

const MOBILE_PROFILE_TAB: Tab = {
  href: '/app/profile',
  label: 'Profile',
  shortLabel: 'Profile',
  icon: <ProfileIcon />,
};

const PROFILE_LINKS = [
  { href: '/app/profile', label: 'Your profile' },
  { href: '/app/profile?view=reports', label: 'Your reports' },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppTabs() {
  const [email, setEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileActive = pathname.startsWith('/app/profile') || pathname.startsWith('/app/reports');

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    void createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-basirah-teal/15 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/app"
              aria-label="Basirah app home"
              className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-basirah-teal"
            >
              <Logo className="h-9 w-auto sm:h-10" />
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {TABS.map((tab) => {
                const active = isActive(pathname, tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-md px-3.5 py-2 text-base font-semibold tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal ${
                      active
                        ? 'bg-basirah-teal text-white'
                        : 'text-basirah-teal hover:bg-basirah-cream'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-base font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none ${
                  profileActive || menuOpen
                    ? 'bg-basirah-teal text-white'
                    : 'text-basirah-teal hover:bg-basirah-cream'
                }`}
              >
                <ProfileIcon />
                Profile
                <svg viewBox="0 0 12 12" aria-hidden className="size-3 fill-none stroke-current">
                  <path d="M2.5 4.5 6 8l3.5-3.5" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute end-0 z-50 mt-1.5 w-56 overflow-hidden rounded-md border border-basirah-teal/20 bg-white py-1 shadow-lg"
                >
                  {email && (
                    <p className="truncate border-b border-basirah-teal/10 px-4 py-2 text-sm text-basirah-teal/60">
                      {email}
                    </p>
                  )}
                  {PROFILE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-base text-basirah-teal transition-colors duration-150 hover:bg-basirah-cream motion-reduce:transition-none"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={signOut}
                    className="block w-full cursor-pointer border-t border-basirah-teal/10 px-4 py-2.5 text-start text-base text-basirah-teal transition-colors duration-150 hover:bg-basirah-cream hover:text-basirah-rust motion-reduce:transition-none"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom bar is fixed on mobile, so every page inside the app shell needs matching
          bottom padding. That lives on the shell, not here. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-basirah-teal/15 bg-white md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="mx-auto flex max-w-md items-stretch">
          {[...TABS, MOBILE_PROFILE_TAB].map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href} className="flex-1">
                <Link
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-basirah-teal ${
                    active ? 'text-basirah-teal' : 'text-basirah-teal/55'
                  }`}
                >
                  <span className={active ? 'opacity-100' : 'opacity-60'}>{tab.icon}</span>
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
