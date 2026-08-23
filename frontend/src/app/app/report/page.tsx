import { ReportForm } from '@/components/report-form';

export default function ReportPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-14">
      <h1 className="text-2xl font-semibold tracking-tight text-basirah-teal sm:text-3xl">
        Report an incident
      </h1>
      <p className="mt-2 text-sm text-basirah-teal/70 sm:mt-3">
        Your report goes to your community&apos;s verification team first.
      </p>

      <div className="mt-8">
        <ReportForm />
      </div>
    </div>
  );
}
