'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { LocationGate } from '@/components/location-gate';
import { MapDetailPanel } from '@/components/map-detail-panel';
import { RadiusChips, useSearchRadius } from '@/components/radius-chips';
import {
  fetchMapIncidents,
  fetchMyMosques,
  fetchNearbyMosques,
  type MapIncident,
  type NearbyMosque,
} from '@/lib/queries';
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

type Selection = { kind: 'mosque'; item: NearbyMosque } | { kind: 'incident'; item: MapIncident };

function formatLabel(value: string | null) {
  if (!value) return 'Uncategorised';
  return value.replace(/_/g, ' ').replace(/^./, (char) => char.toUpperCase());
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
  const [incidents, setIncidents] = useState<MapIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

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

    Promise.all([
      fetchNearbyMosques(lat, lng, radius),
      fetchMapIncidents(lat, lng, radius),
      fetchMyMosques().catch(() => []),
    ])
      .then(([nextMosques, nextIncidents, mine]) => {
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
        setIncidents(nextIncidents);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setMosques([]);
        setIncidents([]);
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
    if (!coords) return;
    mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 12, duration: 900 });
  }, [coords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const width = map.getContainer().clientWidth;
    const right = panelOpen ? Math.min(360, Math.round(width * 0.92)) : 0;
    map.easeTo({ padding: { top: 0, right, bottom: 0, left: 0 }, duration: 350 });
  }, [panelOpen]);

  useEffect(() => {
    if (panelOpen || !selected) return;
    const id = window.setTimeout(() => setSelected(null), 320);
    return () => window.clearTimeout(id);
  }, [panelOpen, selected]);

  const showSelection = (next: Selection) => {
    setSelected(next);
    setPanelOpen(true);
  };

  const requestClose = () => setPanelOpen(false);

  const locationMessage = status === 'manual' ? 'Showing the area you entered.' : null;

  const mosqueCount = `${mosques.length} ${mosques.length === 1 ? 'mosque' : 'mosques'}`;
  const incidentCount =
    incidents.length === 0
      ? 'no verified incidents'
      : `${incidents.length} verified ${incidents.length === 1 ? 'incident' : 'incidents'}`;
  const summary = isLoading
    ? 'Loading nearby mosques and incidents…'
    : `${mosqueCount} · ${incidentCount} nearby`;

  if (!coords) {
    return <LocationGate status={status} onLocate={locate} onManual={setManual} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-basirah-teal/10 bg-white">
      <Map
        ref={mapRef}
        initialViewState={{ longitude: coords.lng, latitude: coords.lat, zoom: 12 }}
        mapStyle={MAP_STYLE}
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelected(null)}
      >
        {coords && (
          <Marker longitude={coords.lng} latitude={coords.lat} anchor="center">
            <span className="block size-3.5 rounded-full border-2 border-white bg-basirah-cyan ring-2 ring-basirah-teal/50" />
          </Marker>
        )}

        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            longitude={mosque.lng}
            latitude={mosque.lat}
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setSelected({ kind: 'mosque', item: mosque });
            }}
          >
            <button
              type="button"
              aria-label={mosque.name}
              className="block cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              <img
                src={
                  selected?.kind === 'mosque' && selected.item.id === mosque.id
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

        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            longitude={incident.lng}
            latitude={incident.lat}
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setSelected({ kind: 'incident', item: incident });
            }}
          >
            <button
              type="button"
              aria-label={`Verified incident: ${formatLabel(incident.category)}`}
              className="block size-3 rotate-45 cursor-pointer border-2 border-white bg-basirah-rust shadow-sm transition-colors hover:bg-basirah-rust/70"
            />
          </Marker>
        ))}
      </Map>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto flex flex-col items-start gap-2">
          <span className="rounded-full border border-basirah-teal/10 bg-white/90 px-3 py-1.5 text-xs font-medium text-basirah-teal/70 backdrop-blur">
            {summary}
          </span>
          <div className="rounded-2xl border border-basirah-teal/10 bg-white/90 p-1 backdrop-blur">
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
          {error && (
            <p className="max-w-[16rem] rounded-2xl border border-basirah-rust/20 bg-white/90 px-3 py-2 text-xs font-medium text-basirah-rust backdrop-blur">
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
            className="cursor-pointer rounded-full border border-basirah-teal/10 bg-white/90 px-4 py-2 text-xs font-semibold text-basirah-teal backdrop-blur transition-colors hover:bg-basirah-cream disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'locating' ? 'Locating…' : 'Use my location'}
          </button>
          {locationMessage && (
            <p className="max-w-[16rem] rounded-2xl border border-basirah-teal/10 bg-white/90 px-3 py-2 text-end text-xs text-basirah-teal/70 backdrop-blur">
              {locationMessage}
            </p>
          )}
        </div>
      </div>

      <ul
        className={`absolute bottom-3 start-3 space-y-1.5 rounded-2xl border border-basirah-teal/10 bg-white/90 px-3 py-2.5 text-xs text-basirah-teal/80 backdrop-blur ${
          selected ? 'max-sm:hidden' : ''
        }`}
      >
        <li className="flex items-center gap-2">
          <img src="/icons/masjid-pin.png" alt="" width={11} height={14} className="shrink-0" />
          Mosque
        </li>
        <li className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rotate-45 border border-white bg-basirah-rust" />
          Verified incident
        </li>
        {coords && (
          <li className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full border border-white bg-basirah-cyan ring-1 ring-basirah-teal/50" />
            You
          </li>
        )}
      </ul>

      {selected && <MapDetailPanel selected={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
