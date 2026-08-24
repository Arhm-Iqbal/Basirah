'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/button-link';
import { LocationGate } from '@/components/location-gate';
import { addMosqueToProfile, fetchNearbyMosques, type NearbyMosque } from '@/lib/queries';
import { useGeolocation } from '@/lib/use-geolocation';

const RADII = [
  { m: 5_000, label: '5 km' },
  { m: 15_000, label: '15 km' },
  { m: 50_000, label: '50 km' },
];

function distance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}

export function MosqueFinder({
  addedIds,
  onAdded,
}: {
  addedIds: Set<string>;
  onAdded: (mosque: NearbyMosque) => void;
}) {
  const { coords, status, locate, setManual } = useGeolocation();
  const [radius, setRadius] = useState(15_000);
  const [results, setResults] = useState<NearbyMosque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') locate();
  }, [status, locate]);

  const load = useCallback(async () => {
    if (!coords) return;
    setIsLoading(true);
    setError(null);
    try {
      setResults(await fetchNearbyMosques(coords.lat, coords.lng, radius, 60));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load nearby mosques.');
    } finally {
      setIsLoading(false);
    }
  }, [coords, radius]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!coords) {
    return <LocationGate status={status} onLocate={locate} onManual={setManual} />;
  }

  const add = async (mosque: NearbyMosque) => {
    setPending(mosque.id);
    setError(null);
    try {
      await addMosqueToProfile(mosque.id);
      onAdded(mosque);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that mosque.');
    } finally {
      setPending(null);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-basirah-teal/55">
          {isLoading ? 'Searching…' : `${results.length} found within ${distance(radius)}`}
        </p>
        <div className="flex gap-1" role="group" aria-label="Search radius">
          {RADII.map((r) => (
            <button
              key={r.m}
              type="button"
              onClick={() => setRadius(r.m)}
              aria-pressed={radius === r.m}
              className={`min-h-9 cursor-pointer rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal ${
                radius === r.m
                  ? 'bg-basirah-teal text-white'
                  : 'text-basirah-teal/60 hover:bg-basirah-teal/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-basirah-rust">{error}</p>}

      {!isLoading && results.length === 0 && !error && (
        <p className="mt-8 text-sm text-basirah-teal/50">
          Nothing within {distance(radius)}. Try a wider radius.
        </p>
      )}

      <ul className="mt-4 divide-y divide-basirah-teal/8">
        {results.map((mosque) => {
          const added = addedIds.has(mosque.id);
          return (
            <li key={mosque.id} className="flex items-center gap-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[0.9375rem] font-medium tracking-[-0.01em] text-basirah-teal">
                  {mosque.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-basirah-teal/50">
                  {distance(mosque.distance_m)}
                  {mosque.address ? ` · ${mosque.address}` : ''}
                </p>
              </div>

              {added ? (
                <span className="shrink-0 text-xs font-medium text-basirah-teal/40">Added</span>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void add(mosque)}
                  disabled={pending === mosque.id}
                  className="shrink-0"
                >
                  {pending === mosque.id ? 'Adding…' : 'Add'}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
