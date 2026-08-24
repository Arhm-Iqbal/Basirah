import { MarketingPage } from '@/components/marketing-page';
import { ReportForm } from '@/components/report-form';

export const metadata = { title: 'Report an Incident · Basirah' };

export default function ReportPage() {
  return (
    <MarketingPage className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-basirah-teal sm:text-[2rem]">
        Report an incident
      </h1>
      <p className="mt-2 text-base text-basirah-teal">
        Your report goes to your community&apos;s verification team first. Skip anything you do not
        know except what happened.
      </p>

      <div className="mt-5">
        <ReportForm />
      </div>
    </MarketingPage>
  );
}
