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
    description: 'A security officer at your mosque reviews and confirms the report.',
  },
  {
    title: 'Alert',
    description: 'Verified incidents reach the community instantly, with no false alarms.',
  },
];

export function GetStarted() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const cards = sectionRef.current.querySelectorAll('[data-card]');

    const ctx = gsap.context(() => {
      gsap.set(cards, { opacity: 0, y: 32 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
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

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              data-card
              className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-basirah-teal/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-basirah-rust text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-basirah-teal">{step.title}</h3>
              <p className="mt-2 text-sm text-basirah-teal/70">{step.description}</p>
            </div>
          ))}
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
