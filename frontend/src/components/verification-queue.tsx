'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/button-link';
import { StatusBadge } from '@/components/status-badge';
import { createClient } from '@/lib/supabase/client';

type PendingIncident = {
  id: string;
  channel: string;
  category: string | null;
  status: string;
  description: string | null;
  occurred_at: string | null;
  created_at: string;
  mosque_id: string | null;
  mosque_name: string | null;
};

type Decision = 'verified' | 'false_alarm';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CHANNEL_LABELS: Record<string, string> = {
  in_person: 'In person',
  online: 'Online',
};

class RequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await createClient().auth.getSession();
  if (!session?.access_token) throw new RequestError(401, 'You are signed out. Sign in again.');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` };
}

async function unwrap(res: Response) {
  if (res.ok) return res.status === 204 ? null : res.json();
  const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  throw new RequestError(
    res.status,
    body?.error?.message ?? 'That did not work. Please try again.',
  );
}

async function fetchPendingIncidents(): Promise<PendingIncident[]> {
  const res = await fetch(`${API_URL}/v1/admin/incidents`, { headers: await authHeaders() });
  const body = (await unwrap(res)) as { data: PendingIncident[] };
  return body.data;
}

async function decideIncident(id: string, status: Decision): Promise<void> {
  const res = await fetch(`${API_URL}/v1/admin/incidents/${id}/verify`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ status }),
  });
  await unwrap(res);
}

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

function IncidentRow({
  incident,
  busy,
  onDecide,
}: {
  incident: PendingIncident;
  busy: boolean;
  onDecide: (id: string, status: Decision) => void;
}) {
  return (
    <li className="rounded-2xl border border-basirah-teal/10 bg-white/80 p-5 backdrop-blur-sm transition-colors duration-150 hover:border-basirah-teal/20">
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

      {incident.mosque_name && (
        <h3 className="mt-3 font-display text-base font-medium tracking-[-0.015em] text-basirah-teal">
          {incident.mosque_name}
        </h3>
      )}

      <p className="mt-2 text-sm leading-relaxed text-basirah-teal/80">
        {incident.description ?? 'No description recorded.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-basirah-teal/8 pt-4">
        <Button
          size="sm"
          variant="teal"
          disabled={busy}
          onClick={() => onDecide(incident.id, 'verified')}
        >
          Verify
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => onDecide(incident.id, 'false_alarm')}
        >
          False alarm
        </Button>
      </div>
    </li>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-basirah-teal/10 bg-white/70 px-6 py-10 text-center backdrop-blur-sm">
      <h2 className="font-display text-lg font-medium tracking-[-0.015em] text-basirah-teal">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-basirah-teal/55">
        {children}
      </p>
    </div>
  );
}

export function VerificationQueue() {
  const [incidents, setIncidents] = useState<PendingIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    fetchPendingIncidents()
      .then((rows) => {
        if (active) setIncidents(rows);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (cause instanceof RequestError && cause.status === 403) {
          setForbidden(true);
          return;
        }
        setError(cause instanceof Error ? cause.message : 'Could not load the review queue.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const decide = async (id: string, status: Decision) => {
    const previous = incidents;
    setError(null);
    setPendingIds((ids) => [...ids, id]);
    setIncidents((rows) => rows.filter((row) => row.id !== id));

    try {
      await decideIncident(id, status);
    } catch (cause) {
      setIncidents(previous);
      setError(cause instanceof Error ? cause.message : 'Could not update that report.');
    } finally {
      setPendingIds((ids) => ids.filter((x) => x !== id));
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-basirah-teal/10 pb-7">
        <p className="text-xs font-medium tracking-[0.14em] text-basirah-teal/40 uppercase">
          Basirah
        </p>
        <h1 className="mt-2.5 font-display text-[2rem] leading-[1.1] font-semibold tracking-[-0.03em] text-basirah-teal sm:text-[2.5rem]">
          Awaiting review
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-basirah-teal/55">
          Nothing reaches the community map until someone here confirms it. Judge what was reported,
          not who reported it.
        </p>
      </header>

      {error && <p className="mt-6 text-sm text-basirah-rust">{error}</p>}

      <section className="mt-8">
        {isLoading ? (
          <p className="text-sm text-basirah-teal/45">Loading…</p>
        ) : forbidden ? (
          <Panel title="You do not have access">
            Reviewing reports is limited to mosque admins, security officers, and regional
            coordinators. If you should be one, ask an admin at your mosque to add you.
          </Panel>
        ) : incidents.length === 0 ? (
          <Panel title="Nothing awaiting review">
            New reports from your mosques appear here as they come in.
          </Panel>
        ) : (
          <ul className="space-y-3">
            {incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                busy={pendingIds.includes(incident.id)}
                onDecide={(id, status) => void decide(id, status)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
