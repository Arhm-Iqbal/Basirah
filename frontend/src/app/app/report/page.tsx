import { ReportWizard } from '@/components/report-wizard';

export const metadata = { title: 'Report an Incident · Basirah' };

export default function AppReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-basirah-teal sm:text-3xl">
        Report an incident
      </h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-basirah-teal/55">
        You will be asked one thing at a time, and you can answer in your own words. Nothing is
        required except a description.
      </p>
      <div className="mt-10">
        <ReportWizard />
      </div>
    </div>
  );
}
