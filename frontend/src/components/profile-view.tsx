'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/button-link';
import { MosqueFinder } from '@/components/mosque-finder';
import { OwnReports } from '@/components/own-reports';
import {
  fetchEnrichment,
  fetchMosqueEvents,
  fetchMyMosques,
  removeMosqueFromProfile,
  type Enrichment,
  type MosqueEvent,
  type MyMosque,
  type NearbyMosque,
} from '@/lib/queries';

function MosqueCard({ mosque, onRemove }: { mosque: MyMosque; onRemove: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState<Enrichment | null>(null);
  const [loadedHours, setLoadedHours] = useState(false);
  const [events, setEvents] = useState<MosqueEvent[] | null>(null);

  useEffect(() => {
    if (!open || loadedHours) return;
    let active = true;
    void fetchMosqueEvents(mosque.id)
      .catch(() => [])
      .then((data) => {
        if (active) setEvents(data);
      });
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
  }, [open, loadedHours, mosque.id]);

  const phone = mosque.phone ?? hours?.phone ?? null;
  const website = mosque.website ?? hours?.website ?? null;

  return (
    <li className="rounded-lg border border-basirah-teal/20 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold tracking-[-0.015em] text-basirah-teal">
            {mosque.name}
          </h3>
          {(mosque.address || mosque.city) && (
            <p className="mt-1 text-base text-basirah-teal/75">
              {[mosque.address, mosque.city, mosque.province].filter(Boolean).join(', ')}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-base">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="font-medium text-basirah-teal underline-offset-4 transition-colors hover:text-basirah-rust hover:underline"
              >
                {phone}
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-basirah-teal underline-offset-4 transition-colors hover:text-basirah-rust hover:underline"
              >
                Website
              </a>
            )}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="cursor-pointer font-semibold text-basirah-teal transition-colors hover:text-basirah-rust"
            >
              {open ? 'Less' : 'Details'}
            </button>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(mosque.id)}
          className="shrink-0"
          aria-label={`Remove ${mosque.name}`}
        >
          Remove
        </Button>
      </div>

      {open && (
        <div className="mt-3 border-t border-basirah-teal/15 pt-3">
          {!loadedHours && <p className="text-base text-basirah-teal/70">Loading…</p>}
          {loadedHours && hours?.opening_hours?.length ? (
            <ul className="space-y-1 text-base text-basirah-teal">
              {hours.opening_hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            loadedHours && (
              <p className="text-base text-basirah-teal/70">
                No published hours for this location yet.
              </p>
            )
          )}

          <h4 className="mt-5 text-sm font-semibold tracking-[-0.01em] text-basirah-teal">
            Upcoming events
          </h4>
          {events === null ? (
            <p className="mt-1.5 text-base text-basirah-teal/70">Loading…</p>
          ) : events.length === 0 ? (
            <p className="mt-1.5 text-base text-basirah-teal/70">No upcoming events listed.</p>
          ) : (
            <ul className="mt-2 space-y-2.5">
              {events.map((event) => (
                <li key={event.id}>
                  <p className="text-base font-medium text-basirah-teal">
                    {event.url ? (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 transition-colors hover:text-basirah-rust hover:underline"
                      >
                        {event.title}
                      </a>
                    ) : (
                      event.title
                    )}
                  </p>
                  <p className="text-sm text-basirah-teal/60">
                    {new Date(event.starts_at).toLocaleString('en-CA', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export function ProfileView({ email }: { email: string | null }) {
  const [mosques, setMosques] = useState<MyMosque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finding, setFinding] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get('view') === 'reports' ? 'reports' : 'mosques';

  useEffect(() => {
    let active = true;
    fetchMyMosques()
      .then((data) => {
        if (!active) return;
        setMosques(data);
        setFinding(data.length === 0);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load your profile.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const remove = async (id: string) => {
    const previous = mosques;
    setMosques((m) => m.filter((x) => x.id !== id));
    try {
      await removeMosqueFromProfile(id);
    } catch (err) {
      setMosques(previous);
      setError(err instanceof Error ? err.message : 'Could not remove that mosque.');
    }
  };

  const onAdded = (mosque: NearbyMosque) => {
    setMosques((current) => [
      ...current,
      {
        id: mosque.id,
        name: mosque.name,
        lat: mosque.lat,
        lng: mosque.lng,
        address: mosque.address,
        city: mosque.city,
        province: null,
        phone: mosque.phone,
        website: mosque.website,
        source: 'osm',
        verified_at: null,
        added_at: new Date().toISOString(),
      },
    ]);
  };

  const reload = () => {
    void fetchMyMosques()
      .then(setMosques)
      .catch(() => undefined);
  };

  const addedIds = new Set(mosques.map((m) => m.id));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="border-b border-basirah-teal/15 pb-4">
        <p className="text-sm font-semibold tracking-[0.12em] text-basirah-teal/70 uppercase">
          Basirah
        </p>
        <h1 className="mt-1.5 font-display text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.03em] text-basirah-teal sm:text-[2rem]">
          Your profile
        </h1>
        {email && <p className="mt-1.5 text-base text-basirah-teal/75">{email}</p>}
      </header>

      {error && <p className="mt-4 text-base text-basirah-rust">{error}</p>}

      <div
        role="tablist"
        aria-label="Profile sections"
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
            onClick={() =>
              router.replace(key === 'mosques' ? '/app/profile' : '/app/profile?view=reports')
            }
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

      {view === 'reports' && <OwnReports />}

      <section className={view === 'reports' ? 'hidden' : 'mt-6'}>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-semibold tracking-[-0.015em] text-basirah-teal">
            Your mosques
            {mosques.length > 0 && (
              <span className="ms-2 text-base font-semibold text-basirah-teal/70">
                {mosques.length}
              </span>
            )}
          </h2>
          {mosques.length > 0 && (
            <button
              type="button"
              onClick={() => setFinding((v) => !v)}
              className="cursor-pointer text-base font-semibold text-basirah-teal transition-colors hover:text-basirah-rust"
            >
              {finding ? 'Done' : 'Add another'}
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="mt-4 text-base text-basirah-teal/70">Loading…</p>
        ) : mosques.length === 0 ? (
          <div className="mt-4 rounded-lg border border-basirah-teal/20 bg-white px-5 py-6 text-center">
            <img
              src="/icons/masjid-pin.png"
              alt=""
              width={30}
              height={38}
              className="mx-auto h-8 w-auto"
            />
            <p className="mx-auto mt-3 max-w-xs text-base leading-relaxed text-basirah-teal">
              Add the mosques you attend. Their details, alerts, and reports all follow from this.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {mosques.map((m) => (
              <MosqueCard key={m.id} mosque={m} onRemove={(id) => void remove(id)} />
            ))}
          </ul>
        )}
      </section>

      {view === 'mosques' && finding && (
        <section className="mt-6 border-t border-basirah-teal/15 pt-5">
          <h2 className="font-display text-xl font-semibold tracking-[-0.015em] text-basirah-teal">
            Near you
          </h2>
          <div className="mt-3">
            <MosqueFinder
              addedIds={addedIds}
              onAdded={onAdded}
              onCreated={reload}
              promoteAdd={mosques.length === 0}
            />
          </div>
        </section>
      )}
    </div>
  );
}
