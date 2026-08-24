'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Logo } from '@/components/logo';
import { NAV_LINKS } from '@/components/nav-links';

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        className="rounded-lg p-2 text-basirah-teal"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-40 bg-basirah-teal/40 transition-opacity duration-200 motion-reduce:transition-none ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <div
        ref={panelRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white px-6 py-5 transition-transform duration-300 motion-reduce:transition-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <Logo className="h-9 w-auto" />
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="rounded-lg p-2 text-basirah-teal"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>

        <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-3 text-base font-medium text-basirah-teal hover:bg-basirah-cream"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 border-t border-basirah-teal/10 pt-6">
          <Link
            href="/login"
            onClick={close}
            className="rounded-xl px-5 py-3 text-center text-sm font-semibold text-basirah-teal hover:bg-basirah-cream"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={close}
            className="rounded-xl bg-basirah-teal px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
