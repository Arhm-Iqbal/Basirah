import type { Metadata } from 'next';

import { MarketingPage } from '@/components/marketing-page';

export const metadata: Metadata = {
  title: 'Privacy · Basirah',
  description: 'A plain-language explanation of what Basirah stores and why.',
};

const sectionClass = 'border-t border-basirah-teal/15 pt-6';
const headingClass = 'font-display text-xl font-semibold tracking-[-0.015em] text-basirah-teal';
const copyClass = 'mt-2 text-base leading-relaxed text-basirah-teal/80';

export default function PrivacyPage() {
  return (
    <MarketingPage className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <header>
        <p className="text-sm font-semibold tracking-[0.12em] text-basirah-teal/65 uppercase">
          Privacy
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-basirah-teal sm:text-4xl">
          What Basirah keeps
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-basirah-teal/80">
          We collect what is needed to receive a report, show nearby resources, and run your
          account. Nothing more.
        </p>
      </header>

      <div className="mt-10 space-y-6 rounded-xl border border-basirah-teal/20 bg-white/80 p-5 shadow-sm sm:p-8">
        <section>
          <h2 className={headingClass}>Reports</h2>
          <p className={copyClass}>
            We save the incident information you submit. That can include your description, date,
            links or account handles, a location you type, support needs, and any files you attach.
            We use it to review the report and provide next steps.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Anonymous reports</h2>
          <p className={copyClass}>
            An anonymous report is not linked to a Basirah account. Its report record has no name,
            email, phone number, user ID, IP address, or browser details. Your claim code is shown
            once; Basirah keeps only a one-way hash of it.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Accounts and contact details</h2>
          <p className={copyClass}>
            Supabase Auth stores the email and account information needed to sign you in. A report
            saved to your account is linked to that account by an internal ID.
          </p>
          <p className={copyClass}>
            The optional name, email, and phone fields inside the report form are different: they
            stay in this browser to prefill your next report and are not sent with the report. They
            are not separately encrypted by Basirah. You can remove them by clearing Basirah&apos;s
            site data in your browser.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Location</h2>
          <p className={copyClass}>
            If you choose “Use my location” on the map, the coordinate is cached in your browser and
            used to request nearby mosques. It is not added to Basirah&apos;s database. If you type
            a location into an incident report, that location becomes part of the report and is
            saved.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Security and access</h2>
          <p className={copyClass}>
            Data is sent over HTTPS. Reports and account data are kept in Supabase with access
            rules. Uploaded evidence and report PDFs are in private storage and open through
            short-lived signed links. The reporter and authorized verification staff can access a
            signed-in report as needed to review it.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Optional writing help</h2>
          <p className={copyClass}>
            If you choose “Fix spelling and grammar,” the text in that box is sent to OpenAI for
            copy-editing. This is optional. Your report-form name, email, and phone fields are not
            included, and no suggested wording replaces yours unless you accept it.
          </p>
        </section>

        <section className={sectionClass}>
          <h2 className={headingClass}>Deleting a signed-in report</h2>
          <p className={copyClass}>
            “Delete for me” only removes the report from your account view. “Delete for everyone”
            removes the report and its related records from Basirah&apos;s active database, along
            with its PDF and uploaded files from storage.
          </p>
        </section>
      </div>

      <p className="mt-6 text-sm text-basirah-teal/60">Last updated August 24, 2026.</p>
    </MarketingPage>
  );
}
