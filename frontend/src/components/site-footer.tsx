import Link from 'next/link';

import { Logo } from '@/components/logo';

const FOOTER_LINKS = [
  { href: '/report', label: 'Report' },
  { href: '/support', label: 'Find Support' },
  { href: '/mosques', label: 'Mosques' },
  { href: '/resources', label: 'Resources' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-basirah-teal">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            aria-label="Basirah home"
            className="inline-flex w-fit rounded-2xl bg-white px-5 py-3"
          >
            <Logo className="h-9 w-auto" />
          </Link>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-basirah-cream/75 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 max-w-2xl border-t border-white/10 pt-8 text-sm leading-relaxed text-basirah-cream/60">
          Basirah does not replace emergency services. If you are in immediate danger, contact your
          local emergency services.
        </p>
      </div>
    </footer>
  );
}
