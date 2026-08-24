import { ArrowRight, Building2, LifeBuoy, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

import { Reveal } from '@/components/reveal';

const PILLARS = [
  {
    icon: ShieldAlert,
    title: 'Report an Incident',
    description:
      'Document online or in-person Islamophobia, threats, discrimination, harassment, or other safety concerns.',
    cta: 'Make a report',
    href: '/report',
  },
  {
    icon: LifeBuoy,
    title: 'Find Support',
    description:
      'Connect with legal, healthcare, mental health, community, and safety professionals who can help.',
    cta: 'Find support',
    href: '/resources',
  },
  {
    icon: Building2,
    title: 'Mosques and Community',
    description:
      'Discover nearby mosques, events, services, programs, and community resources.',
    cta: 'Explore mosques',
    href: '/map',
  },
];

export function Pillars() {
  return (
    <section id="pillars" aria-label="What Basirah offers" className="scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, description, cta, href }, index) => (
            <Reveal key={title} className="h-full" delayMs={index * 90}>
              <Link
                href={href}
                className="group flex h-full min-h-0 flex-col rounded-lg border border-basirah-teal/20 bg-white p-7 transition-colors hover:border-basirah-teal sm:min-h-[26rem] sm:p-10 lg:min-h-[28rem] lg:p-12"
              >
                <Icon className="size-10 text-basirah-rust sm:size-12" aria-hidden />
                <h3 className="mt-6 text-2xl font-semibold text-basirah-teal sm:mt-8 sm:text-3xl">
                  {title}
                </h3>
                <p className="mt-3 flex-1 text-base leading-relaxed text-basirah-teal/80 sm:mt-4 sm:text-xl">
                  {description}
                </p>
                <span className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-basirah-rust px-5 text-base font-semibold text-white transition-colors group-hover:bg-[#a82a0b] sm:min-h-16 sm:px-6 sm:text-xl">
                  {cta}
                  <ArrowRight
                    className="size-5 sm:size-6 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                    aria-hidden
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
