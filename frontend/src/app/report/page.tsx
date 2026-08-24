import { MarketingPage } from '@/components/marketing-page';
import { ReportWizard } from '@/components/report-wizard';

export const metadata = {
  title: 'Report an Incident · Basirah',
  description:
    'Document Islamophobia, hate, harassment, threats, or another safety concern. You can report without an account.',
};

// The public entry point is anonymous by default even when the browser has a session.
// The profile entry point uses the same form but explicitly offers both privacy modes.
export default function ReportPage() {
  return (
    <MarketingPage className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-basirah-teal sm:text-3xl">
        Report an incident
      </h1>
      <p className="mt-2 max-w-lg text-base leading-relaxed text-basirah-teal/75">
        You will be asked one thing at a time, and most questions are a tap. Only a description is
        required. You can report without an account.
      </p>
      <div className="mt-10">
        <ReportWizard />
      </div>
    </MarketingPage>
  );
}
