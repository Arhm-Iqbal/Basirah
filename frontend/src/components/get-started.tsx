'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

import { TealButtonLink } from '@/components/button-link';

const STEPS = [
  {
    title: 'Report',
    description: 'Submit an incident in minutes. No identity questions, only what happened.',
  },
  {
    title: 'Verify',
    description: 'A security officer in your community reviews and confirms the report.',
  },
  {
    title: 'Alert',
    description: 'Verified incidents reach the community instantly, with no false alarms.',
  },
];

export function GetStarted() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineFillXRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const cards = sectionRef.current.querySelectorAll('[data-card]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (prefersReducedMotion || isMobile) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 32, scale: 0.96 });
      gsap.set(lineFillXRef.current, { scaleX: 0 });

      const seam = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          end: 'top 15%',
          scrub: 1,
        },
      });

      seam.to(lineFillXRef.current, { scaleX: 1, ease: 'none', duration: 3 }, 0);

      cards.forEach((card, index) => {
        seam.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'sine.out' }, index);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="get-started" className="hidden bg-basirah-cream md:block">
      <div ref={sectionRef} className="mx-auto max-w-5xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-basirah-teal sm:text-4xl">
            Get started in three steps
          </h2>
          <p className="mt-4 text-base text-basirah-teal/70">
            Basirah is built to be simple for the people who need it most.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="pointer-events-none absolute top-[1.125rem] right-[16.6667%] left-[16.6667%] h-px bg-basirah-teal/10">
            <div ref={lineFillXRef} className="h-full origin-left bg-basirah-rust" />
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                data-card
                className="flex h-full flex-col items-center text-center"
              >
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-basirah-rust text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="mt-5 flex w-full flex-1 flex-col justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-basirah-teal/5">
                  <h3 className="text-lg font-semibold text-basirah-teal">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-basirah-teal/70">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <TealButtonLink href="/signup" className="w-auto min-w-[12rem]">
            Get started
          </TealButtonLink>
        </div>
      </div>
    </section>
  );
}
