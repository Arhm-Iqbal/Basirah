import { ReportWizard } from '@/components/report-wizard';

export const metadata = { title: 'Report an Incident · Basirah' };

export default function AppReportPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-basirah-teal sm:text-[2rem]">
        Report an incident
      </h1>
      <p className="mt-2 max-w-lg text-base leading-relaxed text-basirah-teal">
        One question at a time. Answer in your own words. Only the description is required.
      </p>
      <div className="mt-6">
        <ReportWizard />
      </div>
    </div>
  );
}
