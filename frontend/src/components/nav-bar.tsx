import Link from 'next/link';

import { Logo } from '@/components/logo';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { MARKETING_NAV_LINKS } from '@/lib/nav-links';

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-basirah-teal/15 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        <Link href="/" aria-label="Basirah home">
          <Logo className="h-9 w-auto sm:h-11" />
        </Link>

        <nav className="hidden items-center gap-6 whitespace-nowrap lg:flex">
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-semibold text-basirah-teal transition-colors hover:text-basirah-rust"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 whitespace-nowrap lg:flex">
          <Link
            href="/login"
            className="text-base font-semibold text-basirah-teal transition-colors hover:text-basirah-rust"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-basirah-rust px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-basirah-rust/90"
          >
            Create an account
          </Link>
        </div>

        <MobileSidebar />
      </div>
    </header>
  );
}
