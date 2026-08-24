'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  fetchEnrichment,
  type Enrichment,
  type MapIncident,
  type NearbyMosque,
} from '@/lib/queries';

export type MapSelection =
  | { kind: 'mosque'; item: NearbyMosque }
  | { kind: 'incident'; item: MapIncident };

function formatDistance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)} m away` : `${(metres / 1000).toFixed(1)} km away`;
}

function formatLabel(value: string | null) {
  if (!value) return 'Uncategorised';
  return value.replace(/_/g, ' ').replace(/^./, (char) => char.toUpperCase());
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });
}

function MosqueBody({ mosque, titleId }: { mosque: NearbyMosque; titleId: string }) {
  const [hours, setHours] = useState<Enrichment | null>(null);
  const [loadedHours, setLoadedHours] = useState(false);

  useEffect(() => {
    let active = true;
    setHours(null);
    setLoadedHours(false);
    void fetchEnrichment(mosque.id).then((data) => {
      if (!active) return;
      setHours(data);
      setLoadedHours(true);
    });
    return () => {
      active = false;
    };
  }, [mosque.id]);

  const phone = mosque.phone ?? hours?.phone ?? null;
  const website = mosque.website ?? hours?.website ?? null;
  const address = [mosque.address, mosque.city].filter(Boolean).join(', ');
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lng}`;

  return (
    <>
      <h2 id={titleId} className="font-display text-xl font-semibold tracking-tight text-basirah-teal">
        {mosque.name}
      </h2>
      {address ? <p className="mt-2 text-sm text-basirah-teal/65">{address}</p> : null}
      <p className="mt-2 text-sm font-medium tabular-nums text-basirah-rust">
        {formatDistance(mosque.distance_m)}
      </p>

      <div className="mt-5 flex flex-col gap-2 text-sm">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="font-medium text-basirah-teal underline-offset-4 transition-colors hover:text-basirah-rust hover:underline"
          >
            {phone}
          </a>
        ) : null}
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-basirah-teal underline-offset-4 transition-colors hover:text-basirah-rust hover:underline"
          >
            Visit website
          </a>
        ) : null}
        <a
          href={directions}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-basirah-teal underline-offset-4 transition-colors hover:text-basirah-rust hover:underline"
        >
          Directions
        </a>
      </div>

      <div className="mt-6 border-t border-basirah-teal/10 pt-5">
        <h3 className="text-xs font-semibold tracking-[0.08em] text-basirah-teal/45 uppercase">Hours</h3>
        {!loadedHours ? (
          <p className="mt-2 text-sm text-basirah-teal/45">Loading…</p>
        ) : hours?.opening_hours?.length ? (
          <ul className="mt-2 space-y-1 text-sm text-basirah-teal/70">
            {hours.opening_hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-basirah-teal/45">No published hours for this location yet.</p>
        )}
      </div>
    </>
  );
}

function IncidentBody({ incident, titleId }: { incident: MapIncident; titleId: string }) {
  return (
    <>
      <p className="text-xs font-semibold tracking-[0.08em] text-basirah-rust/80 uppercase">Verified incident</p>
      <h2 id={titleId} className="mt-2 font-display text-xl font-semibold tracking-tight text-basirah-teal">
        {formatLabel(incident.category)}
      </h2>
      <p className="mt-3 text-sm text-basirah-teal/65">
        Reported via {formatLabel(incident.channel).toLowerCase()}
      </p>
      <p className="mt-2 text-sm tabular-nums text-basirah-teal/65">
        {formatWhen(incident.occurred_at ?? incident.created_at)}
      </p>
    </>
  );
}

export function MapDetailPanel({
  selected,
  onClose,
}: {
  selected: MapSelection;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, [selected]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="absolute inset-y-0 end-0 z-20 flex w-[min(100%,22.5rem)] flex-col border-s border-basirah-teal/10 bg-basirah-cream/95 shadow-[-18px_0_40px_rgb(0_0_0_/_18%)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-end px-3 pt-3">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex size-11 cursor-pointer items-center justify-center rounded-full text-basirah-teal/55 transition-colors hover:bg-basirah-teal/5 hover:text-basirah-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal"
          aria-label="Close details"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
            <path
              fill="currentColor"
              d="M6.3 6.3a1 1 0 0 1 1.4 0L12 10.58l4.3-4.28a1 1 0 1 1 1.4 1.42L13.42 12l4.28 4.3a1 1 0 0 1-1.42 1.4L12 13.42l-4.3 4.28a1 1 0 0 1-1.4-1.42L10.58 12 6.3 7.7a1 1 0 0 1 0-1.4Z"
            />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
        {selected.kind === 'mosque' ? (
          <MosqueBody mosque={selected.item} titleId={titleId} />
        ) : (
          <IncidentBody incident={selected.item} titleId={titleId} />
        )}
      </div>
    </aside>
  );
}
