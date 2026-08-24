import {
  ArrowRight,
  Brain,
  GraduationCap,
  HeartHandshake,
  Scale,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { icon: Scale, title: 'Legal Support', description: 'Lawyers and legal clinics familiar with discrimination and hate-motivated cases.' },
  { icon: Brain, title: 'Mental Health', description: 'Counsellors and therapists who understand faith and community context.' },
  { icon: ShieldCheck, title: 'Community Safety', description: 'Safety advisors for mosques, schools, and community organizations.' },
  { icon: HeartHandshake, title: 'Victim Support', description: 'Advocates who can help you understand options and next steps.' },
  { icon: GraduationCap, title: 'Campus Support', description: 'Student advocacy, chaplaincy, and campus safety contacts.' },
  { icon: Stethoscope, title: 'Healthcare', description: 'Practitioners offering care after a physical or psychological incident.' },
];

export function Support() {
  return (
    <section className="bg-basirah-cream">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-2xl">
          <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance text-basirah-teal sm:text-5xl">
            Reporting should not be where support ends.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-basirah-teal/70">
            Documenting what happened is a first step, not the whole answer. After a report,
            Basirah points you toward people who can actually help with what comes next.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map(({ icon: Icon, title, description }) => (
            <li key={title} className="rounded-3xl bg-white p-8">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-basirah-cyan text-basirah-teal">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-6 text-lg font-semibold text-basirah-teal">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-basirah-teal/70">{description}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-base font-semibold text-basirah-rust hover:underline"
          >
            Browse the support directory
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
