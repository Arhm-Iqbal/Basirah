'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { LocationGate } from '@/components/location-gate';
import { MapDetailPanel } from '@/components/map-detail-panel';
import { MosqueSearch } from '@/components/mosque-search';
import { RadiusChips, useSearchRadius } from '@/components/radius-chips';
import { fetchMyMosques, fetchNearbyMosques, type NearbyMosque } from '@/lib/queries';
import { useGeolocation } from '@/lib/use-geolocation';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function metresBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function fitSearchArea(map: MapRef, center: { lat: number; lng: number }, radiusM: number) {
  const latDelta = radiusM / 111_320;
  const longitudeScale = Math.max(Math.cos((center.lat * Math.PI) / 180), 0.2);
  const lngDelta = radiusM / (111_320 * longitudeScale);
  const compact = map.getContainer().clientWidth < 640;

  map.fitBounds(
    [
      [center.lng - lngDelta, center.lat - latDelta],
      [center.lng + lngDelta, center.lat + latDelta],
    ],
    { padding: compact ? 42 : 58, maxZoom: 13, duration: 800 },
  );
}

type Selection = { kind: 'mosque'; item: NearbyMosque };

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

// Phones use a bottom sheet while larger screens use an end drawer. Padding the matching
// edge keeps the selected pin in the visible map instead of throwing it almost off-screen.
function panelPadding(map: MapRef, open: boolean) {
  if (!open) return { top: 0, right: 0, bottom: 0, left: 0 };

  const container = map.getContainer();
  if (container.clientWidth < 768) {
    return {
      top: Math.min(160, Math.round(window.innerHeight * 0.2)),
      right: 0,
      bottom: Math.min(416, Math.round(window.innerHeight * 0.52)),
      left: 0,
    };
  }

  return {
    top: 0,
    right: Math.min(360, Math.round(container.clientWidth * 0.45)),
    bottom: 0,
    left: 0,
  };
}

export function CommunityMap() {
  const { coords, status, locate, setManual } = useGeolocation();
  const mapRef = useRef<MapRef | null>(null);
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

  const [mosques, setMosques] = useState<NearbyMosque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const ignoreMapClick = useRef(false);
  const flyingToResult = useRef(false);

  useEffect(() => {
    if (status === 'idle') locate();
  }, [status, locate]);

  const lat = coords?.lat;
  const lng = coords?.lng;

  useEffect(() => {
    if (lat == null || lng == null) return;

    let active = true;
    setIsLoading(true);
    setError(null);
    setSelected(null);
    setPanelOpen(false);

    Promise.all([fetchNearbyMosques(lat, lng, radius, 100), fetchMyMosques().catch(() => [])])
      .then(([nextMosques, mine]) => {
        if (!active) return;
        const seen = new Set(nextMosques.map((m) => m.id));
        const extras = mine.flatMap((m) =>
          seen.has(m.id) || m.lat == null || m.lng == null
            ? []
            : [
                {
                  id: m.id,
                  name: m.name,
                  lat: m.lat,
                  lng: m.lng,
                  address: m.address,
                  city: m.city,
                  phone: m.phone,
                  website: m.website,
                  distance_m: metresBetween({ lat, lng }, { lat: m.lat, lng: m.lng }),
                },
              ],
        );
        setMosques([...nextMosques, ...extras].sort((a, b) => a.distance_m - b.distance_m));
      })
      .catch((err: unknown) => {
        if (!active) return;
        setMosques([]);
        setError(err instanceof Error ? err.message : 'Could not load map data.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lat, lng, radius]);

  useEffect(() => {
    if (!coords || !mapRef.current) return;
    fitSearchArea(mapRef.current, coords, radius);
  }, [coords, radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // A search result opens the panel and flies in one motion, and that flight already
    // carries the padding. Easing it again here would cancel the flight part-way.
    if (flyingToResult.current) {
      flyingToResult.current = false;
      return;
    }
    map.easeTo({
      ...(panelOpen && selected
        ? { center: [selected.item.lng, selected.item.lat] as [number, number] }
        : {}),
      padding: panelPadding(map, panelOpen),
      duration: 420,
      easing: easeOut,
    });
  }, [panelOpen, selected]);

  useEffect(() => {
    if (panelOpen || !selected) return;
    const id = window.setTimeout(() => setSelected(null), 420);
    return () => window.clearTimeout(id);
  }, [panelOpen, selected]);

  const showSelection = (next: Selection) => {
    ignoreMapClick.current = true;
    setSelected(next);
    setPanelOpen(true);
  };

  const requestClose = () => setPanelOpen(false);

  // Zoom in past the radius view so the pin someone searched for is unambiguous, and open
  // its details in the same gesture -- finding it by name and then having to hunt for the
  // pin would be the same work twice.
  const showOnMap = (mosque: NearbyMosque) => {
    showSelection({ kind: 'mosque', item: mosque });
    const map = mapRef.current;
    if (!map) return;
    flyingToResult.current = true;
    map.flyTo({
      center: [mosque.lng, mosque.lat],
      zoom: 15,
      duration: 900,
      padding: panelPadding(map, true),
    });
  };

  const locationMessage = status === 'manual' ? 'Showing the area you entered.' : null;

  const mosqueCount = `${mosques.length} ${mosques.length === 1 ? 'mosque' : 'mosques'}`;
  const summary = isLoading ? 'Loading nearby mosques…' : `${mosqueCount} nearby`;

  if (!coords) {
    return <LocationGate status={status} onLocate={locate} onManual={setManual} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-basirah-teal/20 bg-white">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: coords.lng, latitude: coords.lat, zoom: 12 }}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onLoad={() => {
          if (mapRef.current) fitSearchArea(mapRef.current, coords, radius);
        }}
        onClick={() => {
          if (ignoreMapClick.current) {
            ignoreMapClick.current = false;
            return;
          }
          requestClose();
        }}
      >
        {coords && (
          <Marker longitude={coords.lng} latitude={coords.lat} anchor="center">
            <span className="block size-3.5 rounded-full border-2 border-white bg-basirah-cyan ring-2 ring-basirah-teal/50" />
          </Marker>
        )}

        {mosques
          .slice()
          .reverse()
          .map((mosque) => (
            <Marker
              key={mosque.id}
              longitude={mosque.lng}
              latitude={mosque.lat}
              anchor="bottom"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                showSelection({ kind: 'mosque', item: mosque });
              }}
            >
              <button
                type="button"
                aria-label={mosque.name}
                className="block cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transform-none"
              >
                <img
                  src={
                    selected?.item.id === mosque.id
                      ? '/icons/masjid-pin-rust.png'
                      : '/icons/masjid-pin.png'
                  }
                  alt=""
                  width={23}
                  height={29}
                  className="drop-shadow-sm"
                />
              </button>
            </Marker>
          ))}
      </Map>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto flex flex-col items-start gap-2">
          <MosqueSearch mosques={mosques} onSelect={showOnMap} />
          <span className="rounded-md border border-basirah-teal/20 bg-white px-2.5 py-1.5 text-sm font-semibold text-basirah-teal">
            {summary}
          </span>
          <div className="rounded-lg border border-basirah-teal/20 bg-white p-0.5">
            <RadiusChips
              radius={radius}
              customMode={customMode}
              customKm={customKm}
              customInputRef={customInputRef}
              onPreset={choosePreset}
              onChooseCustom={chooseCustom}
              onCustomKmChange={setCustomKm}
              onCustomCommit={commitCustom}
              className="flex flex-wrap items-center gap-1"
            />
          </div>
          {!isLoading && !error && mosques.length === 0 && (
            <p className="max-w-[17rem] rounded-md border border-basirah-teal/20 bg-white px-3 py-2 text-sm leading-relaxed text-basirah-teal">
              No listings are available in this area yet. This does not mean there are no mosques
              nearby.
            </p>
          )}
          {error && (
            <p className="max-w-[16rem] rounded-md border border-basirah-rust/30 bg-white px-3 py-2 text-sm font-semibold text-basirah-rust">
              {error}
            </p>
          )}
        </div>

        <div
          className={`pointer-events-auto flex flex-col items-end gap-2 ${selected ? 'invisible' : ''}`}
        >
          <button
            type="button"
            onClick={locate}
            disabled={status === 'locating'}
            className="cursor-pointer rounded-md border border-basirah-teal/25 bg-white px-3.5 py-2 text-sm font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'locating' ? 'Locating…' : 'Use my location'}
          </button>
          {locationMessage && (
            <p className="max-w-[16rem] rounded-md border border-basirah-teal/20 bg-white px-3 py-2 text-end text-sm text-basirah-teal">
              {locationMessage}
            </p>
          )}
        </div>
      </div>

      <ul
        className={`absolute bottom-3 start-3 space-y-1.5 rounded-lg border border-basirah-teal/20 bg-white px-3 py-2.5 text-sm text-basirah-teal ${
          selected ? 'max-sm:hidden' : ''
        }`}
      >
        <li className="flex items-center gap-2">
          <img src="/icons/masjid-pin.png" alt="" width={11} height={14} className="shrink-0" />
          Mosque
        </li>
        {coords && (
          <li className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full border border-white bg-basirah-cyan ring-1 ring-basirah-teal/50" />
            You
          </li>
        )}
      </ul>

      {selected && (
        <>
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 z-10 bg-basirah-teal/10 transition-opacity duration-300 motion-reduce:transition-none md:bg-basirah-teal/25 ${
              panelOpen ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <MapDetailPanel selected={selected} open={panelOpen} onClose={requestClose} />
        </>
      )}
    </div>
  );
}
