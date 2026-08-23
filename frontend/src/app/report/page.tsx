import { NavBar } from '@/components/nav-bar';
import { ReportForm } from '@/components/report-form';

export const metadata = { title: 'Report an Incident · Basirah' };

export default function ReportPage() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal">
          Report an incident
        </h1>
        <p className="mt-3 text-sm text-basirah-teal/70">
          Tell us what happened. Your report goes to your community&apos;s verification team first —
          it is never sent out as a community-wide alert until a person has verified it.
        </p>

        <div className="mt-8">
          <ReportForm />
        </div>
      </main>
    </>
  );
}
