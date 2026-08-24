'use client';

import { useState } from 'react';

import type { Coords, GeoStatus } from '@/lib/use-geolocation';
import { geocodePlace, type GeocodeResult } from '@/lib/queries';

type Props = {
  status: GeoStatus;
  onLocate: () => void;
  onManual: (coords: Coords) => void;
};

export function LocationGate({ status, onLocate, onManual }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = status === 'denied' || status === 'unavailable';

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) return;

    setIsSearching(true);
    setError(null);
    try {
      const found = await geocodePlace(query.trim());
      setResults(found);
      if (found.length === 0) setError('No match for that place. Try a city or postal code.');
    } catch {
      setError('Could not look that up. Check your connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center rounded-lg border border-basirah-teal/20 bg-white p-5">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold tracking-tight text-basirah-teal">
          {blocked ? 'Where are you?' : 'Find mosques near you'}
        </h2>
        <p className="mt-2 text-base text-basirah-teal/80">
          {status === 'denied'
            ? 'Location is blocked for this site. Allow it in your browser settings, or enter your city below.'
            : status === 'unavailable'
              ? 'Your device could not return a location. Enter your city below.'
              : 'We use your location once, to show what is nearby. It is not stored on our servers.'}
        </p>

        {!blocked && (
          <button
            type="button"
            onClick={onLocate}
            disabled={status === 'locating'}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-basirah-teal px-5 text-base font-semibold text-white transition-colors hover:bg-basirah-teal/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-basirah-teal disabled:opacity-60"
          >
            {status === 'locating' ? 'Locating…' : 'Use my location'}
          </button>
        )}

        <form onSubmit={search} className="mt-3 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City or postal code"
            aria-label="City or postal code"
            className="min-h-11 w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 text-base text-basirah-teal outline-none transition-colors placeholder:text-basirah-teal/45 focus:border-basirah-teal"
          />
          <button
            type="submit"
            disabled={isSearching || query.trim().length < 2}
            className="min-h-11 shrink-0 rounded-md border border-basirah-teal/30 px-4 text-base font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream disabled:opacity-40"
          >
            {isSearching ? 'Searching…' : 'Search'}
          </button>
        </form>

        {error && <p role="alert" className="mt-3 text-sm font-medium text-basirah-rust">{error}</p>}

        {results.length > 0 && (
          <ul className="mt-3 space-y-1 text-start">
            {results.map((r) => (
              <li key={`${r.lat},${r.lng}`}>
                <button
                  type="button"
                  onClick={() => onManual({ lat: r.lat, lng: r.lng })}
                  className="w-full rounded-md px-3 py-2 text-start text-sm text-basirah-teal transition-colors hover:bg-basirah-cream"
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
