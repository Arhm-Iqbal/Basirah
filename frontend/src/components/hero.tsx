'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { HeroCanvas } from '@/components/hero-canvas';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !rootRef.current) return;

    const targets = rootRef.current.querySelectorAll('[data-animate]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (prefersReducedMotion || isMobile) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 24 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.1,
      });

      gsap.to(rootRef.current, {
        yPercent: 18,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-basirah-teal">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_top_right,_rgb(208_250_251_/_15%),_transparent_60%)] md:block" />
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <HeroCanvas />
      </div>

      <div
        ref={rootRef}
        className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-28 md:py-32"
      >
        <h1
          data-animate
          className="max-w-xs text-2xl font-semibold leading-tight tracking-tight text-white sm:max-w-2xl sm:text-4xl md:text-6xl"
        >
          <span className="md:hidden">Community security for Canadian mosques.</span>
          <span className="hidden md:inline">
            Protecting Muslims across Canada, together.
          </span>
        </h1>

        <p
          data-animate
          className="mt-4 max-w-xs text-base leading-relaxed text-basirah-cream/90 sm:mt-6 sm:max-w-2xl sm:text-lg"
        >
          <span className="md:hidden">Report incidents. Get verified alerts.</span>
          <span className="hidden md:inline">
            Incident reporting, verified alerts, and open-source threat monitoring built for
            Canadian Muslim communities.
          </span>
        </p>

        <div
          data-animate
          className="mt-8 flex w-full max-w-xs flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
        >
          <Link
            href="/report"
            className="rounded-full bg-basirah-rust px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-basirah-rust/90 sm:px-8"
          >
            Report an incident
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:px-8 md:hidden"
          >
            Create account
          </Link>
          <Link
            href="/about"
            className="hidden rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 md:inline-block"
          >
            Learn more
          </Link>
        </div>
      </div>
    </section>
  );
}
