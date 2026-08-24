import { MarketingPage } from '@/components/marketing-page';

export const metadata = { title: 'Contact · Basirah' };

export default function ContactPage() {
  return (
    <MarketingPage>
      <h1 className="text-2xl font-semibold tracking-tight text-basirah-teal sm:text-3xl md:text-4xl">
        Contact
      </h1>

      <div className="mt-6 space-y-5 text-base text-basirah-teal">
        <div className="rounded-lg border border-basirah-rust/30 bg-basirah-rust/8 p-4">
          <h2 className="font-semibold text-basirah-rust">In an emergency, call 911</h2>
          <p className="mt-2 text-base text-basirah-teal">
            Basirah is not monitored around the clock and does not dispatch an emergency response.
          </p>
        </div>

        <p>
          For questions about the platform, onboarding a mosque, or requesting a facility
          assessment, reach the team at{' '}
          <a
            href="mailto:hello@basirah.ca"
            className="font-medium text-basirah-rust transition-colors hover:text-basirah-rust/80"
          >
            hello@basirah.ca
          </a>
          .
        </p>
        <p className="text-base text-basirah-teal">
          To report an incident, use the report form rather than email — it captures what is
          needed for follow-up and keeps the record consistent.
        </p>
      </div>
    </MarketingPage>
  );
}
