import Link from 'next/link';

import { ReportIncidentTrigger } from '@/components/report-incident/ReportIncidentTrigger';

export function FinalCta() {
  return (
    <section className="bg-basirah-teal">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <h2 className="text-4xl leading-tight font-semibold tracking-tight text-white sm:text-6xl">
          Bring it into the light.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-basirah-cream/80">
          Basirah helps communities see what is happening, document it, and connect people with the
          support they need.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ReportIncidentTrigger size="large" />
          <Link
            href="/support"
            className="rounded-xl border border-white/25 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            Find Support
          </Link>
        </div>
      </div>
    </section>
  );
}
