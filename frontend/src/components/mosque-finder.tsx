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
  promoteAdd = false,
}: {
  addedIds: Set<string>;
  onAdded: (mosque: NearbyMosque) => void;
  onCreated: () => void;
  promoteAdd?: boolean;
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
        <p className="mt-1 mb-5 text-base text-basirah-teal">
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
      {promoteAdd && (
        <div className="mb-5 rounded-lg border border-basirah-teal/20 bg-white p-4">
          <p className="font-display text-base font-semibold tracking-[-0.01em] text-basirah-teal">
            Can&apos;t find your mosque?
          </p>
          <p className="mt-1 text-base leading-relaxed text-basirah-teal">
            Smaller prayer spaces are often missing from public map data. Add yours and it is on
            your map straight away.
          </p>
          <Button size="sm" className="mt-3" onClick={() => setAdding(true)}>
            Add a mosque
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-basirah-teal">
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

      {error && <p className="mt-3 text-base text-basirah-rust">{error}</p>}

      {!isLoading && results.length === 0 && !error && (
        <p className="mt-5 text-base text-basirah-teal">
          Nothing within {distance(radius)}. Try a wider radius.
        </p>
      )}

      <ul className="mt-3 divide-y divide-basirah-teal/15">
        {results.map((mosque) => {
          const added = addedIds.has(mosque.id);
          return (
            <li key={mosque.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-semibold tracking-[-0.01em] text-basirah-teal">
                  {mosque.name}
                </p>
                <p className="mt-0.5 truncate text-sm text-basirah-teal/75">
                  {distance(mosque.distance_m)}
                  {mosque.address ? ` · ${mosque.address}` : ''}
                </p>
              </div>

              {added ? (
                <span className="shrink-0 text-sm font-semibold text-basirah-teal">Added</span>
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

      {!promoteAdd && (
        <div className="mt-5 border-t border-basirah-teal/15 pt-4">
          <p className="text-base text-basirah-teal">Don&apos;t see your mosque?</p>
          <Button size="sm" variant="ghost" className="mt-2" onClick={() => setAdding(true)}>
            Add it
          </Button>
        </div>
      )}
    </section>
  );
}
