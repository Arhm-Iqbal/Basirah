'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { MARKETING_NAV_LINKS, MOBILE_AUTH_LINKS } from '@/lib/nav-links';

import { Logo } from '@/components/logo';

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center rounded-md p-2 text-basirah-teal"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-basirah-teal/40"
          />

          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(100%,18rem)] flex-col gap-1 bg-white px-5 py-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <Logo className="h-10 w-auto" />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="cursor-pointer rounded-md p-2 text-basirah-teal"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="4" x2="20" y2="20" />
                  <line x1="20" y1="4" x2="4" y2="20" />
                </svg>
              </button>
            </div>

            {MARKETING_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium text-basirah-teal/80 hover:bg-basirah-cream hover:text-basirah-rust"
              >
                {link.label}
              </Link>
            ))}

            {MOBILE_AUTH_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-3 text-sm font-medium text-basirah-teal/80 hover:bg-basirah-cream hover:text-basirah-rust"
              >
                {link.label}
              </Link>
            ))}

        <Link
          href="/report"
          onClick={() => setIsOpen(false)}
          className="mt-3 inline-flex min-h-11 items-center justify-center rounded-full bg-basirah-rust px-5 py-3 text-center text-sm font-semibold text-white hover:bg-basirah-rust/90"
        >
          Report an incident
        </Link>
          </div>
        </>
      )}
    </div>
  );
}
