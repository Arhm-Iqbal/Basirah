'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import { fetchEnrichment, type Enrichment, type NearbyMosque } from '@/lib/queries';

export type MapSelection = { kind: 'mosque'; item: NearbyMosque };

function formatDistance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)} m away` : `${(metres / 1000).toFixed(1)} km away`;
}

function ActionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target={href.startsWith('tel:') ? undefined : '_blank'}
      rel={href.startsWith('tel:') ? undefined : 'noreferrer'}
      className="flex min-h-11 items-center border-b border-basirah-cyan/15 text-base font-semibold text-basirah-cyan transition-colors duration-150 hover:text-basirah-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-cyan"
    >
      {children}
    </a>
  );
}

function MosqueBody({ mosque, titleId }: { mosque: NearbyMosque; titleId: string }) {
  const [hours, setHours] = useState<Enrichment | null>(null);
  const [loadedHours, setLoadedHours] = useState(false);

  useEffect(() => {
    let active = true;
    setHours(null);
    setLoadedHours(false);
    void fetchEnrichment(mosque.id)
      .catch(() => null)
      .then((data) => {
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
      <p className="text-[0.6875rem] font-semibold tracking-[0.14em] text-basirah-cyan uppercase">
        Mosque
      </p>
      <h2
        id={titleId}
        className="mt-2 font-display text-2xl font-semibold tracking-tight text-balance text-basirah-cream"
      >
        {mosque.name}
      </h2>
      {address ? <p className="mt-2 text-base text-pretty text-basirah-cream">{address}</p> : null}
      <p className="mt-3 text-base font-semibold tabular-nums text-basirah-cyan">
        {formatDistance(mosque.distance_m)}
      </p>

      <div className="mt-6">
        {phone ? <ActionLink href={`tel:${phone}`}>{phone}</ActionLink> : null}
        {website ? <ActionLink href={website}>Visit website</ActionLink> : null}
        <ActionLink href={directions}>Directions</ActionLink>
      </div>

      <div className="mt-8">
        <h3 className="text-[0.6875rem] font-semibold tracking-[0.14em] text-basirah-cyan/80 uppercase">
          Hours
        </h3>
        {!loadedHours ? (
          <p className="mt-2 text-base text-basirah-cream/80">Loading…</p>
        ) : hours?.opening_hours?.length ? (
          <ul className="mt-3 space-y-1.5 text-base tabular-nums text-basirah-cream">
            {hours.opening_hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-base text-pretty text-basirah-cream/80">
            No published hours for this location yet.
          </p>
        )}
      </div>
    </>
  );
}

export function MapDetailPanel({
  selected,
  open,
  onClose,
}: {
  selected: MapSelection;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [entered, setEntered] = useState(false);
  const pathname = usePathname();
  const insideApp = pathname.startsWith('/app/');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setEntered(true));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open, selected]);

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
      className={`map-drawer fixed inset-x-0 z-20 flex max-h-[52dvh] w-full flex-col rounded-t-2xl bg-basirah-teal shadow-[0_-16px_36px_rgb(4_51_52_/_28%)] md:absolute md:inset-x-auto md:inset-y-0 md:end-0 md:max-h-none md:w-[min(100%,22.5rem)] md:rounded-none md:shadow-[-24px_0_48px_rgb(4_51_52_/_45%)] ${
        insideApp
          ? 'bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-auto'
          : 'bottom-0 md:bottom-auto'
      } ${entered && open ? 'is-open' : ''}`}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 bg-basirah-rust md:inset-y-0 md:start-0 md:end-auto md:h-auto md:w-1"
        aria-hidden
      />

      <div className="flex items-center justify-between px-2 pt-2 md:justify-end">
        <span className="ms-4 h-1 w-10 rounded-full bg-basirah-cream/35 md:hidden" aria-hidden />
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex size-11 cursor-pointer items-center justify-center rounded-md text-basirah-cream transition-[color,background-color,transform] duration-150 hover:bg-white/10 hover:text-white active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-cyan motion-reduce:active:scale-100"
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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6 md:pb-8 md:ps-7">
        <MosqueBody mosque={selected.item} titleId={titleId} />
      </div>
    </aside>
  );
}
