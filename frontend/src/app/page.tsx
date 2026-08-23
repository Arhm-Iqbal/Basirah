import Link from 'next/link';
import { ArrowRight, Building2, Users } from 'lucide-react';
import { ReportIncidentTrigger } from '@/components/report-incident/ReportIncidentTrigger';

const SECTIONS = [
  {
    href: '/support',
    icon: Users,
    title: 'Find Community Support',
    body: 'Muslim lawyers, counsellors, advocates, and community safety contacts who can help after an incident.',
    cta: 'Browse support',
  },
  {
    href: '/mosques',
    icon: Building2,
    title: 'Mosques Near You',
    body: 'Prayer times, upcoming events, facilities, and contact details for mosques in your area.',
    cta: 'Find a mosque',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Community safety and support for Canadian Muslims
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
            Document Islamophobia, hate, harassment, threats, discrimination, or another safety
            concern. Then find people who can help.
          </p>
          <div className="mt-8">
            <ReportIncidentTrigger size="large" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {SECTIONS.map(({ href, icon: Icon, title, body, cta }) => (
            <Link
              key={href}
              href={href}
              className="border-ink/10 hover:border-ink/35 group flex flex-col rounded-2xl border bg-white p-6 transition-colors"
            >
              <span className="bg-mist text-ink flex size-11 items-center justify-center rounded-xl">
                <Icon className="size-5" aria-hidden />
              </span>
              <h2 className="text-ink mt-4 text-lg font-semibold tracking-tight">{title}</h2>
              <p className="text-ink/70 mt-2 flex-1 text-sm leading-relaxed">{body}</p>
              <span className="text-ink mt-4 flex items-center gap-1.5 text-sm font-semibold">
                {cta}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
