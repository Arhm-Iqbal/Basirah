import { User } from 'lucide-react';
import Link from 'next/link';

import { Logo } from '@/components/logo';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { NAV_LINKS } from '@/components/nav-links';

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-basirah-teal/10 bg-basirah-cyan">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-6 focus:z-10 focus:rounded-lg focus:bg-basirah-teal focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Basirah home" className="shrink-0">
          <Logo className="h-20 w-auto" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-basirah-teal/75 transition-colors hover:text-basirah-teal"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-basirah-teal/75 transition-colors hover:text-basirah-teal"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-basirah-teal px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Sign Up
          </Link>
          <Link
            href="/profile"
            aria-label="Your profile"
            className="ml-1 flex size-10 items-center justify-center rounded-full bg-white text-basirah-teal transition-colors hover:bg-basirah-cream"
          >
            <User className="size-5" aria-hidden />
          </Link>
        </div>

        <MobileSidebar />
      </div>
    </header>
  );
}
