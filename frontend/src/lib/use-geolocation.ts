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
            current === 'idle' || current === 'locating' ? 'denied' : current,
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
