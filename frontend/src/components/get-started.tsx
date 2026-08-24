'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

import { TealButtonLink } from '@/components/button-link';

const STEPS = [
  {
    title: 'You write it',
    description: 'Describe the behaviour. There are no fields for how someone looked.',
  },
  {
    title: 'Someone checks it',
    description: 'A security officer in your community reads it before it goes any further.',
  },
  {
    title: 'Neighbours are told',
    description: 'If it checks out, nearby mosques get the alert. Unverified reports stay quiet.',
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
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-basirah-teal sm:text-4xl">
            How a report moves
          </h2>
          <p className="mt-4 text-base leading-relaxed text-basirah-teal">
            You write what happened. A person in your mosque checks it. Only then does an alert go
            out.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="pointer-events-none absolute top-[1.125rem] right-[16.6667%] left-[16.6667%] h-px bg-basirah-teal/10">
            <div ref={lineFillXRef} className="h-full origin-left bg-basirah-rust" />
          </div>

          <ol className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} data-card className="flex h-full flex-col">
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-basirah-rust text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div
                  className={
                    index === 0
                      ? 'mt-5 flex w-full flex-1 flex-col rounded-lg border border-basirah-rust/25 bg-basirah-rust/5 p-5'
                      : 'mt-5 flex w-full flex-1 flex-col pt-1'
                  }
                >
                  <h3 className="text-lg font-semibold text-basirah-teal">{step.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-basirah-teal">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14">
          <TealButtonLink href="/signup" className="w-auto min-w-[12rem]">
            Create an account
          </TealButtonLink>
        </div>
      </div>
    </section>
  );
}
