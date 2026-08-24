'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/button-link';
import { TidyWriting } from '@/components/tidy-writing';
import {
  appealReport,
  deleteReport,
  editReport,
  downloadReport,
  fetchOwnIncidents,
  type DeleteReportScope,
  type OwnIncident,
} from '@/lib/queries';

const CHANNEL_LABELS: Record<string, string> = {
  in_person: 'In person',
  online: 'Online',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function label(value: string) {
  return value.replace(/_/g, ' ');
}

function DownloadButton({ incidentId }: { incidentId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await downloadReport(incidentId);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not download the PDF.');
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? 'Preparing…' : 'Download PDF'}
      </Button>
      {error && <p className="mt-2 text-sm text-basirah-rust">{error}</p>}
    </>
  );
}

// Mirrors the EDITABLE list the API enforces; once a report is verified or alerted it
// has been acted on and the server returns 409.
const EDITABLE_STATUSES = ['submitted', 'triaged'];

function ReportActions({ incident, onRemoved }: { incident: OwnIncident; onRemoved: () => void }) {
  const [mode, setMode] = useState<'idle' | 'confirmDelete' | 'appeal' | 'edit'>('idle');
  const [draft, setDraft] = useState(incident.description ?? '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [deletingFor, setDeletingFor] = useState<DeleteReportScope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appealed, setAppealed] = useState(false);

  const run = async (fn: () => Promise<void>, after: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      after();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not work.');
    } finally {
      setBusy(false);
    }
  };

  if (appealed) {
    return (
      <p className="text-base text-basirah-teal/75">
        Appeal filed. Your community&apos;s verification team will review it.
      </p>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="w-full">
        <label
          htmlFor={`edit-${incident.id}`}
          className="text-base font-semibold text-basirah-teal"
        >
          Correct what you wrote
        </label>
        <p className="mt-1 text-sm text-basirah-teal/70">Your saved PDF is regenerated to match.</p>
        <textarea
          id={`edit-${incident.id}`}
          rows={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mt-2 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none focus:border-basirah-teal"
        />
        <TidyWriting text={draft} onAccept={setDraft} />
        {error && <p className="mt-2 text-sm text-basirah-rust">{error}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy || draft.trim().length < 10}
            onClick={() =>
              void run(
                () => editReport(incident.id, { description: draft.trim() }),
                () => {
                  incident.description = draft.trim();
                  setMode('idle');
                },
              )
            }
          >
            {busy ? 'Saving…' : 'Save changes'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => {
              setDraft(incident.description ?? '');
              setMode('idle');
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'confirmDelete') {
    return (
      <div className="w-full">
        <p className="text-base font-semibold text-basirah-teal">Who should it be deleted for?</p>
        <p className="mt-1 text-sm text-basirah-teal/70">
          These choices handle the stored report differently. Read both before continuing.
        </p>
        {error && <p className="mt-2 text-sm text-basirah-rust">{error}</p>}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-basirah-teal/20 bg-basirah-cream/45 p-4">
            <h3 className="font-semibold text-basirah-teal">Delete for me</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-basirah-teal/75">
              Removes this report from your account only. The report and its data remain stored by
              Basirah.
            </p>
            <Button
              className="mt-3 w-full"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setDeletingFor('me');
                void run(() => deleteReport(incident.id, 'me'), onRemoved);
              }}
            >
              {busy && deletingFor === 'me' ? 'Deleting…' : 'Delete for me'}
            </Button>
          </div>

          <div className="rounded-lg border border-basirah-rust/30 bg-basirah-rust/5 p-4">
            <h3 className="font-semibold text-basirah-rust">Delete for everyone</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-basirah-teal/80">
              Permanently removes this report, its PDF, and attachments from Basirah&apos;s active
              database and storage. This cannot be undone.
            </p>
            <Button
              className="mt-3 w-full"
              size="sm"
              variant="primary"
              disabled={busy}
              onClick={() => {
                setDeletingFor('everyone');
                void run(() => deleteReport(incident.id, 'everyone'), onRemoved);
              }}
            >
              {busy && deletingFor === 'everyone' ? 'Deleting permanently…' : 'Delete for everyone'}
            </Button>
          </div>
        </div>
        <div className="mt-3">
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setMode('idle')}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'appeal') {
    return (
      <div>
        <label
          htmlFor={`appeal-${incident.id}`}
          className="text-base font-semibold text-basirah-teal"
        >
          What was wrong with this report?
        </label>
        <p className="mt-1 text-sm text-basirah-teal/70">
          A person reviews every appeal. Upholding one takes the report off the community map.
        </p>
        <textarea
          id={`appeal-${incident.id}`}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-2 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none focus:border-basirah-teal"
        />
        {error && <p className="mt-2 text-sm text-basirah-rust">{error}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy || reason.trim().length < 10}
            onClick={() =>
              void run(
                () => appealReport(incident.id, reason.trim()),
                () => setAppealed(true),
              )
            }
          >
            {busy ? 'Filing…' : 'File appeal'}
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => setMode('idle')}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DownloadButton incidentId={incident.id} />
      {EDITABLE_STATUSES.includes(incident.status) && (
        <Button size="sm" variant="ghost" onClick={() => setMode('edit')}>
          Edit
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => setMode('appeal')}>
        Appeal
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setMode('confirmDelete')}>
        Delete
      </Button>
    </div>
  );
}

export function OwnReports() {
  const [incidents, setIncidents] = useState<OwnIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchOwnIncidents()
      .then((rows) => {
        if (active) setIncidents(rows);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Could not load your reports.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-basirah-teal sm:text-[2rem]">
            My reports
          </h1>
          <p className="mt-1.5 text-base text-basirah-teal">
            Every incident you have submitted, newest first.
          </p>
        </div>
        <Link
          href="/app/report"
          className="rounded-md bg-basirah-rust px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-basirah-rust/90"
        >
          New report
        </Link>
      </div>

      <div className="mt-5">
        {isLoading && <p className="text-base text-basirah-teal/70">Loading your reports…</p>}

        {!isLoading && error && (
          <div className="rounded-lg border border-basirah-teal/20 bg-white p-4">
            <p className="text-base text-basirah-rust">{error}</p>
          </div>
        )}

        {!isLoading && !error && incidents.length === 0 && (
          <div className="rounded-lg border border-basirah-teal/20 bg-white p-6 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-basirah-teal">
              No reports yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-base text-basirah-teal">
              When you report an incident it appears here, along with where it is in the
              verification process.
            </p>
            <Link
              href="/app/report"
              className="mt-4 inline-block rounded-md bg-basirah-teal px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-basirah-teal/90"
            >
              Report an incident
            </Link>
          </div>
        )}

        {!isLoading && !error && incidents.length > 0 && (
          <ul className="space-y-2.5">
            {incidents.map((incident) => (
              <li
                key={incident.id}
                className="rounded-lg border border-basirah-teal/20 bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <StatusBadge status={incident.status} />
                  <span className="text-sm font-medium text-basirah-teal">
                    {CHANNEL_LABELS[incident.channel] ?? label(incident.channel)}
                  </span>
                  {incident.category && (
                    <>
                      <span className="text-sm text-basirah-teal/40">·</span>
                      <span className="text-sm font-medium text-basirah-teal capitalize">
                        {label(incident.category)}
                      </span>
                    </>
                  )}
                  <span className="ms-auto text-sm font-medium tabular-nums text-basirah-teal">
                    {formatDate(incident.occurred_at ?? incident.created_at)}
                  </span>
                </div>

                <p className="mt-2.5 line-clamp-2 text-base text-basirah-teal">
                  {incident.description ?? 'No description recorded.'}
                </p>

                <div className="mt-3.5 border-t border-basirah-teal/10 pt-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/app/reports/${incident.id}/next-steps`}
                      className="inline-flex min-h-9 items-center rounded-md bg-basirah-teal px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0a4749]"
                    >
                      View next steps
                    </Link>
                    <ReportActions
                      incident={incident}
                      onRemoved={() =>
                        setIncidents((rows) => rows.filter((r) => r.id !== incident.id))
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
