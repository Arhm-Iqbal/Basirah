'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import { HeroCanvas } from '@/components/hero-canvas';
import { PrimaryButtonLink, SecondaryButtonLink } from '@/components/button-link';

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
        yPercent: 12,
        opacity: 0.35,
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,_rgb(208_250_251_/_12%),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-basirah-teal/20 via-transparent to-basirah-teal" />
      <div className="pointer-events-none absolute inset-0">
        <HeroCanvas />
      </div>

      <div
        ref={rootRef}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24 md:py-32"
      >
        <p
          data-animate
          className="text-xs font-medium tracking-[0.2em] text-basirah-cyan/80 uppercase"
        >
          Basirah
        </p>

        <h1
          data-animate
          className="mt-4 max-w-xs text-2xl font-semibold leading-tight tracking-tight text-white sm:max-w-2xl sm:text-4xl md:text-6xl"
        >
          <span className="md:hidden">Community security for Canadian mosques.</span>
          <span className="hidden md:inline">Protecting Muslims across Canada, together.</span>
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
          className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-10 sm:max-w-md sm:flex-row sm:justify-center"
        >
          <PrimaryButtonLink href="/report">Report an incident</PrimaryButtonLink>
          <SecondaryButtonLink href="/signup">Create account</SecondaryButtonLink>
        </div>

        <Link
          data-animate
          href="/about"
          className="mt-5 text-sm font-medium text-basirah-cyan/90 transition-colors hover:text-white"
        >
          Learn how Basirah works →
        </Link>
      </div>
    </section>
  );
}
