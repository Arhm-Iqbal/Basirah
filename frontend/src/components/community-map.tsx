'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Marker, Popup, type MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  fetchMapIncidents,
  fetchNearbyMosques,
  type MapIncident,
  type NearbyMosque,
} from '@/lib/queries';
import { FALLBACK_CENTER, useGeolocation } from '@/lib/use-geolocation';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

type Selection = { kind: 'mosque'; item: NearbyMosque } | { kind: 'incident'; item: MapIncident };

function formatDistance(metres: number) {
  return metres < 1000 ? `${Math.round(metres)} m away` : `${(metres / 1000).toFixed(1)} km away`;
}

function formatLabel(value: string | null) {
  if (!value) return 'Uncategorised';
  return value.replace(/_/g, ' ').replace(/^./, (char) => char.toUpperCase());
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });
}

export function CommunityMap() {
  const { coords, status, locate } = useGeolocation();
  const mapRef = useRef<MapRef | null>(null);

  const [mosques, setMosques] = useState<NearbyMosque[]>([]);
  const [incidents, setIncidents] = useState<MapIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);

  useEffect(() => {
    locate();
  }, [locate]);

  const { lat, lng } = coords ?? FALLBACK_CENTER;

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    setSelected(null);

    Promise.all([fetchNearbyMosques(lat, lng), fetchMapIncidents(lat, lng)])
      .then(([nextMosques, nextIncidents]) => {
        if (!active) return;
        setMosques(nextMosques);
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
  }, [lat, lng]);

  useEffect(() => {
    if (!coords) return;
    mapRef.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 12, duration: 900 });
  }, [coords]);

  const locationMessage =
    status === 'denied'
      ? 'Location is off, so the map is showing Toronto. Allow location in your browser settings to centre it on you.'
      : status === 'unavailable'
        ? 'Your browser could not return a location. The map is showing Toronto instead.'
        : null;

  const mosqueCount = `${mosques.length} ${mosques.length === 1 ? 'mosque' : 'mosques'}`;
  const incidentCount =
    incidents.length === 0
      ? 'no verified incidents'
      : `${incidents.length} verified ${incidents.length === 1 ? 'incident' : 'incidents'}`;
  const summary = isLoading
    ? 'Loading nearby mosques and incidents…'
    : `${mosqueCount} · ${incidentCount} nearby`;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-basirah-teal/10 bg-white">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: FALLBACK_CENTER.lng,
          latitude: FALLBACK_CENTER.lat,
          zoom: 11,
        }}
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
            anchor="center"
            onClick={(event) => {
              event.originalEvent.stopPropagation();
              setSelected({ kind: 'mosque', item: mosque });
            }}
          >
            <button
              type="button"
              aria-label={mosque.name}
              className="block size-3.5 cursor-pointer rounded-full border-2 border-white bg-basirah-teal shadow-sm transition-colors hover:bg-basirah-teal/70"
            />
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

        {selected?.kind === 'mosque' && (
          <Popup
            longitude={selected.item.lng}
            latitude={selected.item.lat}
            anchor="bottom"
            offset={16}
            maxWidth="260px"
            closeOnClick={false}
            onClose={() => setSelected(null)}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-basirah-teal">{selected.item.name}</p>
              {selected.item.address && (
                <p className="text-xs text-basirah-teal/70">
                  {selected.item.address}
                  {selected.item.city ? `, ${selected.item.city}` : ''}
                </p>
              )}
              <p className="text-xs font-medium text-basirah-rust">
                {formatDistance(selected.item.distance_m)}
              </p>
              {selected.item.phone && (
                <a
                  href={`tel:${selected.item.phone}`}
                  className="block text-xs font-medium text-basirah-teal underline-offset-2 transition-colors hover:text-basirah-rust hover:underline"
                >
                  {selected.item.phone}
                </a>
              )}
              {selected.item.website && (
                <a
                  href={selected.item.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-xs font-medium text-basirah-teal underline-offset-2 transition-colors hover:text-basirah-rust hover:underline"
                >
                  Visit website
                </a>
              )}
            </div>
          </Popup>
        )}

        {selected?.kind === 'incident' && (
          <Popup
            longitude={selected.item.lng}
            latitude={selected.item.lat}
            anchor="bottom"
            offset={16}
            maxWidth="260px"
            closeOnClick={false}
            onClose={() => setSelected(null)}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-basirah-teal">
                {formatLabel(selected.item.category)}
              </p>
              <p className="text-xs text-basirah-teal/70">
                Reported via {formatLabel(selected.item.channel).toLowerCase()}
              </p>
              <p className="text-xs text-basirah-teal/70">
                {formatWhen(selected.item.occurred_at ?? selected.item.created_at)}
              </p>
            </div>
          </Popup>
        )}
      </Map>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
        <div className="pointer-events-auto flex flex-col items-start gap-2">
          <span className="rounded-full border border-basirah-teal/10 bg-white/90 px-3 py-1.5 text-xs font-medium text-basirah-teal/70 backdrop-blur">
            {summary}
          </span>
          {error && (
            <p className="max-w-[16rem] rounded-2xl border border-basirah-rust/20 bg-white/90 px-3 py-2 text-xs font-medium text-basirah-rust backdrop-blur">
              {error}
            </p>
          )}
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-2">
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

      <ul className="absolute bottom-3 start-3 space-y-1.5 rounded-2xl border border-basirah-teal/10 bg-white/90 px-3 py-2.5 text-xs text-basirah-teal/80 backdrop-blur">
        <li className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full border border-white bg-basirah-teal" />
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
    </div>
  );
}
