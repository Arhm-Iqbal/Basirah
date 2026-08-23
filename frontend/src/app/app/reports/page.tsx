'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/status-badge';
import { fetchOwnIncidents, type OwnIncident } from '@/lib/queries';

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

export default function ReportsPage() {
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
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-basirah-teal">My reports</h1>
          <p className="mt-3 text-sm text-basirah-teal/70">
            Every incident you have submitted, newest first.
          </p>
        </div>
        <Link
          href="/app/report"
          className="rounded-full bg-basirah-rust px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-basirah-rust/90"
        >
          New report
        </Link>
      </div>

      <div className="mt-8">
        {isLoading && <p className="text-sm text-basirah-teal/50">Loading your reports…</p>}

        {!isLoading && error && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-basirah-teal/5">
            <p className="text-sm text-basirah-rust">{error}</p>
          </div>
        )}

        {!isLoading && !error && incidents.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-basirah-teal/5">
            <h2 className="text-lg font-semibold tracking-tight text-basirah-teal">
              No reports yet
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-basirah-teal/70">
              When you report an incident it appears here, along with where it is in the
              verification process.
            </p>
            <Link
              href="/app/report"
              className="mt-6 inline-block rounded-full bg-basirah-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-basirah-teal/90"
            >
              Report an incident
            </Link>
          </div>
        )}

        {!isLoading && !error && incidents.length > 0 && (
          <ul className="space-y-3">
            {incidents.map((incident) => (
              <li
                key={incident.id}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-basirah-teal/5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <StatusBadge status={incident.status} />
                  <span className="text-xs text-basirah-teal/60">
                    {CHANNEL_LABELS[incident.channel] ?? label(incident.channel)}
                  </span>
                  {incident.category && (
                    <>
                      <span className="text-xs text-basirah-teal/25">·</span>
                      <span className="text-xs text-basirah-teal/60 capitalize">
                        {label(incident.category)}
                      </span>
                    </>
                  )}
                  <span className="ms-auto text-xs text-basirah-teal/50">
                    {formatDate(incident.occurred_at ?? incident.created_at)}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-basirah-teal/80">
                  {incident.description ?? 'No description recorded.'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
