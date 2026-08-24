'use client';

import Link from 'next/link';
import { useState } from 'react';

import { GhostButtonLink, TealButtonLink } from '@/components/button-link';
import { StatusBadge } from '@/components/status-badge';

type View = 'mosques' | 'reports';

const reports = [
  {
    id: 'online',
    status: 'submitted',
    channel: 'Online',
    category: 'Hate speech',
    date: 'Aug 23, 2026',
    description:
      'A public post used anti-Muslim language and encouraged others to target a community event.',
  },
  {
    id: 'in-person',
    status: 'verified',
    channel: 'In person',
    category: 'Harassment',
    date: 'Aug 21, 2026',
    description:
      'A person made repeated anti-Muslim comments near the entrance to a community facility.',
  },
] as const;

export function DemoProfile() {
  const [view, setView] = useState<View>('mosques');
  const [openReport, setOpenReport] = useState<string | null>(null);

  return (
    <div>
      <div
        role="status"
        className="rounded-lg border border-basirah-rust/30 bg-white/85 px-4 py-3 text-sm leading-relaxed text-basirah-teal shadow-sm"
      >
        <span className="font-semibold text-basirah-rust">Reviewer demo · read-only</span>
        <span className="ms-2">
          Everything on this page is sample data. Nothing is submitted, changed, or saved.
        </span>
      </div>

      <header className="mt-6 border-b border-basirah-teal/15 pb-4">
        <p className="text-sm font-semibold tracking-[0.12em] text-basirah-teal/70 uppercase">
          Basirah
        </p>
        <h1 className="mt-1.5 font-display text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.03em] text-basirah-teal sm:text-[2rem]">
          Demo profile
        </h1>
        <p className="mt-1.5 text-base text-basirah-teal/75">Sample member account</p>
      </header>

      <div
        role="tablist"
        aria-label="Demo profile sections"
        className="mt-8 -mx-4 flex gap-1 overflow-x-auto border-b border-basirah-teal/15 px-4 sm:mx-0 sm:px-0"
      >
        {(
          [
            ['mosques', 'Your mosques'],
            ['reports', 'Your reports'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={`-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-base font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal motion-reduce:transition-none ${
              view === key
                ? 'border-basirah-teal text-basirah-teal'
                : 'border-transparent text-basirah-teal/55 hover:text-basirah-teal'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'mosques' ? (
        <section className="mt-6" aria-labelledby="demo-mosques-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2
              id="demo-mosques-heading"
              className="font-display text-xl font-semibold tracking-[-0.015em] text-basirah-teal"
            >
              Your mosques <span className="ms-2 text-base text-basirah-teal/65">1</span>
            </h2>
            <span className="text-sm font-semibold text-basirah-teal/55">Preview only</span>
          </div>

          <article className="mt-3 rounded-lg border border-basirah-teal/20 bg-white p-4 shadow-sm">
            <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
              Al Rashid Mosque
            </h3>
            <p className="mt-1 text-base text-basirah-teal/75">13070 113 Street NW, Edmonton, AB</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <GhostButtonLink href="/map" size="sm">
                Open community map
              </GhostButtonLink>
              <GhostButtonLink href="/resources" size="sm">
                View resources
              </GhostButtonLink>
            </div>
          </article>

          <div className="mt-6 rounded-lg border border-basirah-teal/15 bg-white/65 p-4">
            <h3 className="font-semibold text-basirah-teal">What a signed-in member can do</h3>
            <ul className="mt-2 list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-basirah-teal/75">
              <li>Save the mosques they attend and see mosque details and events.</li>
              <li>Keep account-linked reports and their verification status together.</li>
              <li>Edit, download, hide, or permanently delete their own reports.</li>
            </ul>
          </div>
        </section>
      ) : (
        <section className="mt-6" aria-labelledby="demo-reports-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="demo-reports-heading"
                className="font-display text-xl font-semibold tracking-[-0.015em] text-basirah-teal"
              >
                Your reports
              </h2>
              <p className="mt-1 text-sm text-basirah-teal/70">Sample reports, newest first.</p>
            </div>
            <TealButtonLink href="/report" size="sm">
              Try the report form
            </TealButtonLink>
          </div>

          <ul className="mt-4 space-y-3">
            {reports.map((report) => {
              const open = openReport === report.id;
              return (
                <li
                  key={report.id}
                  className="rounded-lg border border-basirah-teal/20 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <StatusBadge status={report.status} />
                    <span className="text-sm font-medium text-basirah-teal">{report.channel}</span>
                    <span className="text-sm text-basirah-teal/40">·</span>
                    <span className="text-sm font-medium text-basirah-teal">{report.category}</span>
                    <span className="ms-auto text-sm font-medium tabular-nums text-basirah-teal">
                      {report.date}
                    </span>
                  </div>
                  <p className="mt-2.5 text-base leading-relaxed text-basirah-teal">
                    {report.description}
                  </p>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenReport(open ? null : report.id)}
                    className="mt-3 min-h-10 cursor-pointer rounded-md bg-basirah-teal px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a4749] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
                  >
                    {open ? 'Hide sample next steps' : 'Preview next steps'}
                  </button>

                  {open && (
                    <div className="mt-4 border-t border-basirah-teal/10 pt-4">
                      <h3 className="font-semibold text-basirah-teal">
                        {report.id === 'online'
                          ? 'Next steps for an online incident'
                          : 'Next steps for an in-person incident'}
                      </h3>
                      <ol className="mt-3 space-y-3 text-sm leading-relaxed text-basirah-teal/80">
                        <li>
                          <span className="font-semibold text-basirah-teal">
                            1. Preserve evidence.
                          </span>{' '}
                          Keep the original post, message, link, date, or location details before
                          taking another action.
                        </li>
                        <li>
                          <span className="font-semibold text-basirah-teal">
                            2. Use the right route.
                          </span>{' '}
                          {report.id === 'online'
                            ? 'Basirah links to the selected platform’s official reporting page and explains what to keep from its decision.'
                            : 'Basirah explains when to contact site staff, police, victim services, or a human-rights agency.'}
                        </li>
                        <li>
                          <span className="font-semibold text-basirah-teal">
                            3. Keep the outcome.
                          </span>{' '}
                          Save confirmation numbers and responses with the report.
                        </li>
                      </ol>
                      {report.id === 'online' && (
                        <a
                          href="https://help.x.com/en/safety-and-security/report-abusive-behavior"
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex text-sm font-semibold text-basirah-rust underline-offset-4 hover:underline"
                        >
                          Open X reporting help
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-basirah-teal/15 pt-5">
        <TealButtonLink href="/report">Try an anonymous report</TealButtonLink>
        <GhostButtonLink href="/signup">Create a real account</GhostButtonLink>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center px-2 text-base font-semibold text-basirah-teal transition-colors hover:text-basirah-rust"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
