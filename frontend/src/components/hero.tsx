'use client';

import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import { HeroCanvas } from '@/components/hero-canvas';

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const targets = rootRef.current.querySelectorAll('[data-animate]');

    gsap.set(targets, { opacity: 0, y: 24 });
    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.1,
    });
  }, []);

  return (
    <section className="relative overflow-hidden bg-basirah-teal">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgb(208_250_251_/_15%),_transparent_60%)]" />
      <HeroCanvas />

      <div
        ref={rootRef}
        className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-28 text-center sm:py-32"
      >
        <span
          data-animate
          className="rounded-full bg-basirah-cyan/10 px-4 py-1.5 text-xs font-medium tracking-wider text-basirah-cyan uppercase"
        >
          Community Security Infrastructure
        </span>

        <h1
          data-animate
          className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
        >
          Protecting mosques across Canada, together.
        </h1>

        <p data-animate className="mt-6 max-w-2xl text-lg text-basirah-cream/90">
          Incident reporting, verified alerts, and open-source threat monitoring built for
          Canadian Muslim communities.
        </p>

        <div data-animate className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#get-started"
            className="rounded-full bg-basirah-rust px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-basirah-rust/90"
          >
            Get Started
          </a>
          <a
            href="#about"
            className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
}
