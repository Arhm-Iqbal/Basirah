import { ReportIncidentTrigger } from '@/components/report-incident/ReportIncidentTrigger';
import { NavBar } from '@/components/nav-bar';

export default function ReportPage() {
  return (
    <>
      <NavBar />
      <main className="bg-basirah-teal">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center text-white">
          <span className="rounded-full bg-basirah-cyan/10 px-4 py-1.5 text-xs font-medium tracking-wider text-basirah-cyan uppercase">
            Report an incident
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Document what happened, in your own words.
          </h1>
          <p className="mt-4 max-w-xl text-basirah-cream/90">
            No identity questions unless you want to answer them. A security officer in your
            community reviews every report before anything reaches an alert.
          </p>
          <div className="mt-8">
            <ReportIncidentTrigger label="Report an Incident" size="large" />
          </div>
        </div>
      </main>
    </>
  );
}
