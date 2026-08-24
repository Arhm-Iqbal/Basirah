'use client';

import { useCallback, useEffect, useState } from 'react';

export type Coords = { lat: number; lng: number };

export type GeoStatus =
  'idle' | 'prompting' | 'locating' | 'ready' | 'denied' | 'unavailable' | 'manual';

const STORAGE_KEY = 'basirah.coords';

// There is deliberately no fallback city. Silently centring on the wrong place is worse
// than admitting we do not know yet: someone in Edmonton seeing Toronto mosques has no
// way to tell the map is broken rather than empty.
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeoStatus>('idle');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCoords(JSON.parse(saved) as Coords);
        setStatus('ready');
      }
    } catch {
      // Private mode and blocked site data both throw here; a missing cache is not an error.
    }
  }, []);

  const remember = useCallback((next: Coords, nextStatus: GeoStatus) => {
    setCoords(next);
    setStatus(nextStatus);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not being able to cache the fix is survivable; the session still has it.
    }
  }, []);

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => remember({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'ready'),
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 300_000 },
    );
  }, [remember]);

  const setManual = useCallback(
    (next: Coords) => {
      remember(next, 'manual');
    },
    [remember],
  );

  const clear = useCallback(() => {
    setCoords(null);
    setStatus('idle');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // See above.
    }
  }, []);

  return { coords, status, locate, setManual, clear };
}
