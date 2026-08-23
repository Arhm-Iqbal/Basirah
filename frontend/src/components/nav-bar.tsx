import Link from 'next/link';

import { Logo } from '@/components/logo';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { MARKETING_NAV_LINKS } from '@/lib/nav-links';

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-basirah-teal/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" aria-label="Basirah home">
          <Logo className="h-7 w-auto sm:h-8" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {MARKETING_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-basirah-teal/80 transition-colors hover:text-basirah-rust"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-basirah-teal/80 transition-colors hover:text-basirah-rust"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-basirah-rust px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-basirah-rust/90"
          >
            Get Started
          </Link>
        </div>

        <MobileSidebar />
      </div>
    </header>
  );
}
