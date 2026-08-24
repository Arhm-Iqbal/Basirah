'use client';

import { useCallback, useEffect, useState } from 'react';

import { AddMosqueForm } from '@/components/add-mosque-form';
import { Button } from '@/components/button-link';
import { LocationGate } from '@/components/location-gate';
import { RadiusChips, useSearchRadius } from '@/components/radius-chips';
import { addMosqueToProfile, fetchNearbyMosques, type NearbyMosque } from '@/lib/queries';
import { useGeolocation } from '@/lib/use-geolocation';

function distance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
}

export function MosqueFinder({
  addedIds,
  onAdded,
  onCreated,
}: {
  addedIds: Set<string>;
  onAdded: (mosque: NearbyMosque) => void;
  onCreated: () => void;
}) {
  const { coords, status, locate, setManual } = useGeolocation();
  const {
    radius,
    customMode,
    customKm,
    setCustomKm,
    customInputRef,
    commitCustom,
    choosePreset,
    chooseCustom,
  } = useSearchRadius(15_000);
  const [results, setResults] = useState<NearbyMosque[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

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

  if (adding) {
    return (
      <div>
        <h3 className="font-display text-base font-medium tracking-[-0.015em] text-basirah-teal">
          Add a mosque
        </h3>
        <p className="mt-1 mb-6 text-sm text-basirah-teal/55">
          Tell us what you know. Only the name is required.
        </p>
        <AddMosqueForm
          nearby={coords}
          onCreated={() => {
            setAdding(false);
            onCreated();
          }}
          onCancel={() => setAdding(false)}
        />
      </div>
    );
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
        <RadiusChips
          radius={radius}
          customMode={customMode}
          customKm={customKm}
          customInputRef={customInputRef}
          onPreset={choosePreset}
          onChooseCustom={chooseCustom}
          onCustomKmChange={setCustomKm}
          onCustomCommit={commitCustom}
        />
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

      <div className="mt-6 border-t border-basirah-teal/10 pt-5">
        <p className="text-sm text-basirah-teal/60">Don&apos;t see your mosque?</p>
        <Button size="sm" variant="ghost" className="mt-2.5" onClick={() => setAdding(true)}>
          Add it
        </Button>
      </div>
    </section>
  );
}
