'use client';

import { useCallback, useEffect, useState } from 'react';

export type Coords = { lat: number; lng: number };

export type GeoStatus =
  'idle' | 'prompting' | 'locating' | 'ready' | 'denied' | 'unavailable' | 'manual';

const STORAGE_KEY = 'basirah.coords';
const DEVICE_CACHE_MS = 15 * 60 * 1000;
const MANUAL_CACHE_MS = 24 * 60 * 60 * 1000;

type StoredCoords = Coords & {
  source: 'device' | 'manual';
  saved_at: number;
};

// There is deliberately no fallback city. Silently centring on the wrong place is worse
// than admitting we do not know yet: someone in Edmonton seeing Toronto mosques has no
// way to tell the map is broken rather than empty.
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeoStatus>('prompting');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<StoredCoords>;
        const source = parsed.source === 'manual' ? 'manual' : 'device';
        const maxAge = source === 'manual' ? MANUAL_CACHE_MS : DEVICE_CACHE_MS;
        const valid =
          typeof parsed.lat === 'number' &&
          Number.isFinite(parsed.lat) &&
          parsed.lat >= -90 &&
          parsed.lat <= 90 &&
          typeof parsed.lng === 'number' &&
          Number.isFinite(parsed.lng) &&
          parsed.lng >= -180 &&
          parsed.lng <= 180 &&
          typeof parsed.saved_at === 'number' &&
          Date.now() - parsed.saved_at <= maxAge;

        if (valid) {
          setCoords({ lat: parsed.lat as number, lng: parsed.lng as number });
          setStatus(source === 'manual' ? 'manual' : 'ready');
          return;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Private mode and blocked site data both throw here; a missing cache is not an error.
    }
    setStatus('idle');
  }, []);

  const remember = useCallback((next: Coords, nextStatus: GeoStatus) => {
    setCoords(next);
    setStatus(nextStatus);
    try {
      const stored: StoredCoords = {
        ...next,
        source: nextStatus === 'manual' ? 'manual' : 'device',
        saved_at: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
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

    const options = { enableHighAccuracy: true, timeout: 15_000, maximumAge: 300_000 };
    const onFix = (pos: GeolocationPosition) =>
      remember({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 'ready');
    const onGiveUp = (err: GeolocationPositionError) =>
      setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable');

    const onFirstFailure = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setStatus('denied');
        return;
      }
      // A provider that has only just been unblocked reports POSITION_UNAVAILABLE for a
      // moment before it can produce a fix, which is exactly the moment the permission
      // watcher below asks. One retry turns that into a location instead of a dead end.
      window.setTimeout(() => {
        navigator.geolocation.getCurrentPosition(onFix, onGiveUp, options);
      }, 1200);
    };

    navigator.geolocation.getCurrentPosition(onFix, onFirstFailure, options);
  }, [remember]);

  // Location permission is granted and revoked in browser settings, outside this page.
  // Without watching for it, someone who unblocks the site sits on the manual gate until
  // they happen to reload, which reads as the map simply not working.
  useEffect(() => {
    const permissions = typeof navigator === 'undefined' ? undefined : navigator.permissions;
    if (!permissions?.query) return;

    let live = true;
    let handle: PermissionStatus | null = null;

    const sync = () => {
      if (!live || !handle) return;
      if (handle.state === 'granted') locate();
      else if (handle.state === 'denied') setStatus('denied');
    };

    permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((result) => {
        if (!live) {
          return;
        }
        handle = result;
        // Only correct a status that is still waiting on a fix. A coordinate already
        // restored from cache or typed in by hand stays valid whatever the permission says.
        if (result.state === 'denied') {
          setStatus((current) =>
            current === 'prompting' || current === 'idle' || current === 'locating'
              ? 'denied'
              : current,
          );
        }
        result.addEventListener('change', sync);
      })
      .catch(() => {
        // Older Safari has no geolocation entry in the permissions registry. Requesting
        // still works there, so this is a missing optimisation rather than a failure.
      });

    return () => {
      live = false;
      handle?.removeEventListener('change', sync);
    };
  }, [locate]);

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
