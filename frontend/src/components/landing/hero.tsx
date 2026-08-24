import { ArrowRight, Paperclip } from 'lucide-react';
import Link from 'next/link';

import { ReportIncidentTrigger } from '@/components/report-incident/ReportIncidentTrigger';

const MOCK_STEPS = ['Location', 'Details', 'Support', 'Review'];

export function Hero() {
  return (
    <section className="bg-basirah-cream">
      <div className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance text-basirah-teal sm:text-6xl">
            See it. Report it. Respond to it.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-basirah-teal/70 sm:text-xl">
            Basirah gives Muslim communities one place to report Islamophobia, find support, and
            stay connected.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ReportIncidentTrigger size="large" />
            <Link
              href="#pillars"
              className="inline-flex items-center gap-2 rounded-xl border border-basirah-teal/20 px-6 py-3.5 text-base font-semibold text-basirah-teal transition-colors hover:bg-white"
            >
              Explore Basirah
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-16 sm:mt-20">
          <ReportingPreview />
        </div>
      </div>
    </section>
  );
}

function ReportingPreview() {
  return (
    <div
      aria-hidden
      className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white ring-1 ring-basirah-teal/10"
    >
      <div className="flex items-center justify-between border-b border-basirah-teal/10 px-6 py-4 sm:px-8">
        <p className="text-xs font-semibold tracking-widest text-basirah-teal/70 uppercase">
          Report an Incident
        </p>
        <p className="text-xs font-medium text-basirah-teal/70">Step 2 of 4</p>
      </div>

      <div className="flex gap-2 px-6 pt-5 sm:px-8">
        {MOCK_STEPS.map((step, index) => (
          <div key={step} className="flex-1">
            <div
              className={`h-1 rounded-full ${index <= 1 ? 'bg-basirah-rust' : 'bg-basirah-teal/10'}`}
            />
            <p className="mt-2 hidden text-xs font-medium text-basirah-teal/70 sm:block">{step}</p>
          </div>
        ))}
      </div>

      <div className="px-6 pt-8 pb-6 sm:px-8">
        <p className="text-xl font-semibold tracking-tight text-basirah-teal sm:text-2xl">
          What happened?
        </p>
        <p className="mt-2 text-sm text-basirah-teal/70">
          Tell it in your own words. There is no right way to write this.
        </p>

        <div className="mt-5 rounded-2xl border border-basirah-teal/15 bg-basirah-cream/40 p-5">
          <p className="text-base leading-relaxed text-basirah-teal/80">
            A group shouted slurs at people leaving evening prayer and followed them to the parking
            lot.
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-basirah-teal/70">
          <Paperclip className="size-4" aria-hidden />
          Add screenshots or evidence
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-basirah-teal/10 bg-white px-6 py-4 sm:px-8">
        <span className="text-sm font-semibold text-basirah-teal/70">Back</span>
        <span className="rounded-xl bg-basirah-rust px-5 py-2.5 text-sm font-semibold text-white">
          Continue
        </span>
      </div>
    </div>
  );
}
