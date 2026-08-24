import { ArrowRight, Building2, LifeBuoy, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

const PILLARS = [
  {
    icon: ShieldAlert,
    title: 'Report an Incident',
    description:
      'Document online or in-person Islamophobia, threats, discrimination, harassment, or other safety concerns.',
    cta: 'Make a Report',
    href: '/report',
  },
  {
    icon: LifeBuoy,
    title: 'Find Support',
    description:
      'Connect with legal, healthcare, mental health, community, and safety professionals who can help.',
    cta: 'Find Support',
    href: '/support',
  },
  {
    icon: Building2,
    title: 'Mosques Near You',
    description:
      'Discover nearby mosques, events, services, programs, and community resources.',
    cta: 'Explore Mosques',
    href: '/mosques',
  },
];

export function Pillars() {
  return (
    <section id="pillars" className="scroll-mt-20 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <h2 className="max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-balance text-basirah-teal sm:text-5xl">
          One platform. Three ways to support your community.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, description, cta, href }) => (
            <Link
              key={title}
              href={href}
              className="group flex flex-col rounded-3xl bg-basirah-cream p-8 transition-colors hover:bg-basirah-cyan sm:p-10"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-basirah-rust">
                <Icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-8 text-xl font-semibold tracking-tight text-basirah-teal sm:text-2xl">
                {title}
              </h3>
              <p className="mt-3 flex-1 leading-relaxed text-basirah-teal/70">{description}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-basirah-rust">
                {cta}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
