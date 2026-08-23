'use client';

import { Info, Pencil } from 'lucide-react';
import type { IncidentReport, IncidentRoute } from '@/types/incident-report';

type ReviewRow = { label: string; value: string };
type ReviewSection = { title: string; stepIndex: number; rows: ReviewRow[] };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function evidenceSummary(report: IncidentReport): string {
  if (report.evidence.length === 0) return '';
  return report.evidence
    .map((item) => `${item.file.name} (${formatBytes(item.file.size)})`)
    .join('\n');
}

function sharedSections(report: IncidentReport, contactStepIndex: number): ReviewSection[] {
  return [
    {
      title: 'Evidence',
      stepIndex: contactStepIndex,
      rows: [{ label: 'Files attached', value: evidenceSummary(report) }],
    },
    {
      title: 'Your Information',
      stepIndex: contactStepIndex,
      rows: [
        { label: 'Name', value: report.reporter_name },
        { label: 'Email', value: report.reporter_email },
        { label: 'Phone', value: report.reporter_phone },
        { label: 'Reporting for', value: report.reporting_for },
        { label: 'Already reported to', value: report.reported_elsewhere },
        { label: 'Existing reference', value: report.existing_reference },
      ],
    },
    {
      title: 'Support Requested',
      stepIndex: contactStepIndex,
      rows: [
        { label: 'Help you would like', value: report.support_needed },
        { label: 'Anything else', value: report.anything_else },
      ],
    },
  ];
}

function buildSections(report: IncidentReport, route: IncidentRoute): ReviewSection[] {
  if (route === 'online') {
    // The online flow gives evidence a step of its own, so it points somewhere different than
    // the contact sections that follow it.
    const [evidence, ...contactSections] = sharedSections(report, 3);

    return [
      {
        title: 'Online Incident',
        stepIndex: 0,
        rows: [
          { label: 'Where it occurred', value: report.online_platform },
          { label: 'Link', value: report.online_url },
          { label: 'Account or person involved', value: report.online_account },
          { label: 'Who or what was targeted', value: report.target },
          { label: 'Date', value: report.occurred_on },
          { label: 'Approximate time', value: report.occurred_at },
          { label: 'Approximate timing', value: report.timing_note },
          { label: 'Still happening', value: report.still_happening },
        ],
      },
      {
        title: 'What Happened',
        stepIndex: 1,
        rows: [
          { label: 'Threats or violence', value: report.threats },
          { label: 'Person or account responsible', value: report.responsible_description },
          { label: 'Description', value: report.description },
          { label: 'Other details', value: report.other_details },
        ],
      },
      { ...evidence, stepIndex: 2 },
      ...contactSections,
    ];
  }

  return [
    {
      title: 'Location',
      stepIndex: 0,
      rows: [
        { label: 'Where it occurred', value: report.location_kind },
        { label: 'Location name', value: report.location_name },
        { label: 'Address or area', value: report.location_address },
      ],
    },
    {
      title: 'People & Timing',
      stepIndex: 1,
      rows: [
        { label: 'Who was targeted', value: report.target },
        { label: 'Who carried it out', value: report.responsible_party },
        { label: 'Description of those involved', value: report.responsible_description },
        { label: 'Date', value: report.occurred_on },
        { label: 'Approximate time', value: report.occurred_at },
        { label: 'Approximate timing', value: report.timing_note },
        { label: 'How long it lasted', value: report.duration },
        { label: 'Witnesses', value: report.witnesses },
        { label: 'Witness details', value: report.witness_details },
      ],
    },
    {
      title: 'What Happened',
      stepIndex: 2,
      rows: [
        { label: 'Threats or immediate danger', value: report.threats },
        { label: 'Weapon', value: report.weapon },
        { label: 'Description', value: report.description },
        { label: 'Before the incident', value: report.before_context },
        { label: 'Afterward', value: report.after_context },
        { label: 'Other details', value: report.other_details },
      ],
    },
    ...sharedSections(report, 3),
  ];
}

export function ReviewReport({
  report,
  route,
  onEdit,
}: {
  report: IncidentReport;
  route: IncidentRoute;
  onEdit: (stepIndex: number) => void;
}) {
  const sections = buildSections(report, route);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-ink text-2xl font-semibold tracking-tight">Review Your Report</h2>
        <p className="text-ink/75 mt-2 leading-relaxed">
          Have a look through before you send it. You can go back and change anything.
        </p>
      </div>

      {sections.map((section) => {
        const filled = section.rows.filter((row) => row.value.trim() !== '');

        return (
          <section
            key={section.title}
            className="border-ink/10 overflow-hidden rounded-2xl border bg-white"
          >
            <header className="border-ink/10 flex items-center justify-between gap-3 border-b px-5 py-3.5">
              <h3 className="text-ink text-base font-semibold">{section.title}</h3>
              <button
                type="button"
                onClick={() => onEdit(section.stepIndex)}
                className="text-ink hover:bg-mist flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors"
              >
                <Pencil className="size-3.5" aria-hidden />
                Edit
                <span className="sr-only"> {section.title}</span>
              </button>
            </header>

            {filled.length > 0 ? (
              <dl className="divide-ink/10 divide-y">
                {filled.map((row) => (
                  <div key={row.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[12rem_1fr]">
                    <dt className="text-ink/60 text-xs font-semibold tracking-wide uppercase">
                      {row.label}
                    </dt>
                    <dd className="text-ink text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-ink/55 px-5 py-3.5 text-sm">Nothing added.</p>
            )}
          </section>
        );
      })}

      <div className="border-ink/15 bg-mist rounded-2xl border p-5">
        <div className="flex items-start gap-3">
          <Info className="text-ink mt-0.5 size-5 shrink-0" aria-hidden />
          <div>
            <h3 className="text-ink text-base font-semibold">Before you submit</h3>
            <p className="text-ink/80 mt-1.5 text-sm leading-relaxed">
              This hackathon version is a prototype. A production reporting system would require
              secure storage, access controls, privacy policies, and clearly defined procedures for
              handling and sharing reports.
            </p>
            <p className="text-ink/80 mt-2 text-sm leading-relaxed">
              Only provide information that you are comfortable submitting.
            </p>
          </div>
        </div>
      </div>

      <p className="text-ink/75 text-sm leading-relaxed">
        By selecting Submit Report, you confirm that the information you have provided is accurate
        to the best of your knowledge and that you understand this is currently a prototype.
      </p>
    </div>
  );
}
