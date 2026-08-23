import type { Metadata } from 'next';
import { TriangleAlert } from 'lucide-react';
import { ReportIncidentTrigger } from '@/components/report-incident/ReportIncidentTrigger';

export const metadata: Metadata = {
  title: 'Report an Incident',
  description:
    'Document Islamophobia, hate, harassment, threats, discrimination, or another safety concern.',
};

export default function ReportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <h1 className="text-ink text-3xl font-semibold tracking-tight sm:text-4xl">
        Report an Incident
      </h1>
      <p className="text-ink/75 mt-4 leading-relaxed">
        Use this form to document Islamophobia, hate, harassment, threats, discrimination,
        suspicious activity, or another safety concern. You will be asked one question at a time,
        and you can answer in your own words.
      </p>

      <div className="border-rust/30 border-l-rust mt-8 rounded-2xl border border-l-4 bg-white p-5">
        <div className="flex items-start gap-3">
          <TriangleAlert className="text-rust mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <h2 className="text-rust text-base font-semibold">Are you in immediate danger?</h2>
            <p className="text-ink/80 mt-1.5 text-sm leading-relaxed">
              If you or someone else is in immediate danger, contact your local emergency services.
              This reporting form is intended for documentation and follow-up, not emergency
              response.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ReportIncidentTrigger size="large" label="Start a report" />
      </div>

      <div className="border-ink/15 bg-mist mt-10 rounded-2xl border p-5">
        <h2 className="text-ink text-base font-semibold">Before you begin</h2>
        <p className="text-ink/80 mt-1.5 text-sm leading-relaxed">
          This hackathon version is a prototype. A production reporting system would require secure
          storage, access controls, privacy policies, and clearly defined procedures for handling
          and sharing reports. Only provide information that you are comfortable submitting.
        </p>
      </div>
    </main>
  );
}
