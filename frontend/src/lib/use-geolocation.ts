'use client';

import { useCallback, useState } from 'react';

export type Coords = { lat: number; lng: number };

// Toronto. Used only as an initial map view so the page is never blank; it is replaced
// the moment the browser returns a real fix, and is never submitted as a report location.
export const FALLBACK_CENTER: Coords = { lat: 43.6532, lng: -79.3832 };

export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<'idle' | 'locating' | 'ready' | 'denied' | 'unavailable'>(
    'idle',
  );

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('ready');
      },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  return { coords, status, locate };
}
