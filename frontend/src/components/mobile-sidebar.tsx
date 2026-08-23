'use client';

import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { href: '#about', label: 'About Us' },
  { href: '#report', label: 'Report' },
  { href: '#resources', label: 'Resources' },
  { href: '#contact', label: 'Contact' },
];

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (isOpen) {
      gsap.set(overlayRef.current, { display: 'block' });
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.to(panelRef.current, { x: '0%', duration: 0.35, ease: 'power3.out' });
    } else {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => gsap.set(overlayRef.current!, { display: 'none' }),
      });
    }
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
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
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div
        ref={overlayRef}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-40 hidden bg-basirah-teal/40 opacity-0"
      />

      <div
        ref={panelRef}
        className="fixed inset-y-0 right-0 z-50 flex w-72 translate-x-full flex-col gap-1 bg-white px-6 py-6 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <span className="text-lg font-semibold tracking-tight text-basirah-teal">Basirah</span>
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
            >
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>
        </div>

        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
            className="rounded-md px-2 py-2.5 text-sm font-medium text-basirah-teal/80 hover:bg-basirah-cream hover:text-basirah-rust"
          >
            {link.label}
          </a>
        ))}

        <a
          href="#get-started"
          onClick={() => setIsOpen(false)}
          className="mt-4 rounded-full bg-basirah-rust px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-basirah-rust/90"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
