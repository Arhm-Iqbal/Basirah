'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/button-link';
import { MosqueFinder } from '@/components/mosque-finder';
import {
  fetchEnrichment,
  fetchMyMosques,
  removeMosqueFromProfile,
  type Enrichment,
  type MyMosque,
  type NearbyMosque,
} from '@/lib/queries';

function MosqueCard({ mosque, onRemove }: { mosque: MyMosque; onRemove: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState<Enrichment | null>(null);
  const [loadedHours, setLoadedHours] = useState(false);

  useEffect(() => {
    if (!open || loadedHours) return;
    let active = true;
    void fetchEnrichment(mosque.id).then((data) => {
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
    <li className="py-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base font-medium tracking-[-0.015em] text-basirah-teal">
            {mosque.name}
          </h3>
          {(mosque.address || mosque.city) && (
            <p className="mt-1 text-sm text-basirah-teal/55">
              {[mosque.address, mosque.city, mosque.province].filter(Boolean).join(', ')}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
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
              className="cursor-pointer text-basirah-teal/50 transition-colors hover:text-basirah-teal"
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
        <div className="mt-4 border-t border-basirah-teal/8 pt-4">
          {!loadedHours && <p className="text-sm text-basirah-teal/45">Loading…</p>}
          {loadedHours && hours?.opening_hours?.length ? (
            <ul className="space-y-1 text-sm text-basirah-teal/65">
              {hours.opening_hours.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : (
            loadedHours && (
              <p className="text-sm text-basirah-teal/45">
                No published hours for this location yet.
              </p>
            )
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
    <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
      <header>
        <h1 className="font-display text-[1.75rem] font-semibold tracking-[-0.02em] text-basirah-teal sm:text-3xl">
          Your profile
        </h1>
        {email && <p className="mt-1.5 text-sm text-basirah-teal/50">{email}</p>}
      </header>

      {error && <p className="mt-6 text-sm text-basirah-rust">{error}</p>}

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-medium tracking-[-0.015em] text-basirah-teal">
            Your mosques
          </h2>
          {mosques.length > 0 && (
            <button
              type="button"
              onClick={() => setFinding((v) => !v)}
              className="cursor-pointer text-sm font-medium text-basirah-teal/55 transition-colors hover:text-basirah-teal"
            >
              {finding ? 'Done' : 'Add another'}
            </button>
          )}
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-basirah-teal/45">Loading…</p>
        ) : mosques.length === 0 ? (
          <p className="mt-3 max-w-md text-sm leading-relaxed text-basirah-teal/55">
            Add the mosques you attend. Their details, alerts, and reports all follow from this.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-basirah-teal/8">
            {mosques.map((m) => (
              <MosqueCard key={m.id} mosque={m} onRemove={(id) => void remove(id)} />
            ))}
          </ul>
        )}
      </section>

      {finding && (
        <section className="mt-10 border-t border-basirah-teal/10 pt-8">
          <h2 className="font-display text-lg font-medium tracking-[-0.015em] text-basirah-teal">
            Near you
          </h2>
          <div className="mt-4">
            <MosqueFinder addedIds={addedIds} onAdded={onAdded} onCreated={reload} />
          </div>
        </section>
      )}
    </div>
  );
}
