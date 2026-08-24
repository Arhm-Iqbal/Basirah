'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/button-link';
import { downloadReport, fetchOwnIncidents, type OwnIncident } from '@/lib/queries';

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
                  <DownloadButton incidentId={incident.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
