'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

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
  const lineFillYRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const cards = sectionRef.current.querySelectorAll('[data-card]');

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 32 });
      gsap.set([lineFillXRef.current, lineFillYRef.current], { scaleX: 0, scaleY: 0 });

      const seam = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          end: 'bottom 55%',
          scrub: 0.6,
        },
      });

      seam.to(
        [lineFillXRef.current, lineFillYRef.current],
        { scaleX: 1, scaleY: 1, ease: 'none', duration: cards.length },
        0,
      );

      cards.forEach((card, index) => {
        seam.to(card, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, index);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="get-started" className="bg-basirah-cream">
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
          <div className="pointer-events-none absolute top-[1.125rem] right-[16.6667%] left-[16.6667%] hidden h-px bg-basirah-teal/10 sm:block">
            <div ref={lineFillXRef} className="h-full origin-left bg-basirah-rust" />
          </div>
          <div className="pointer-events-none absolute top-5 bottom-5 left-[1.125rem] w-px bg-basirah-teal/10 sm:hidden">
            <div ref={lineFillYRef} className="w-full origin-top bg-basirah-rust" />
          </div>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                data-card
                className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
              >
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-basirah-rust text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-basirah-teal/5 sm:mt-5 sm:w-full sm:p-8">
                  <h3 className="text-lg font-semibold text-basirah-teal">{step.title}</h3>
                  <p className="mt-2 text-sm text-basirah-teal/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="#"
            className="rounded-full bg-basirah-teal px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-basirah-teal/90"
          >
            Get Started Now
          </a>
        </div>
      </div>
    </section>
  );
}
