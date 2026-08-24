'use client';

import { useState } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Button } from '@/components/button-link';
import { createMosque, geocodePlace } from '@/lib/queries';
import type { Coords } from '@/lib/use-geolocation';

const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

const field =
  'mt-1.5 w-full rounded-xl border border-basirah-teal/15 bg-white px-3.5 py-2.5 text-basirah-teal outline-none transition-colors placeholder:text-basirah-teal/35 focus:border-basirah-teal/40';
const label = 'block text-sm font-medium text-basirah-teal';

export function AddMosqueForm({
  nearby,
  onCreated,
  onCancel,
}: {
  nearby: Coords | null;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');

  // Where the pin lands. Seeded from the finder's current centre so a mosque added from a
  // search around you is on the map immediately, even if the address cannot be resolved.
  const [coords, setCoords] = useState<Coords | null>(nearby);
  const [pinned, setPinned] = useState<string | null>(nearby ? 'your current area' : null);

  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findAddress = async () => {
    const query = [address, city, province, 'Canada'].filter(Boolean).join(', ');
    if (query.replace(/[\s,]/g, '').length < 6) {
      setError('Add an address or city first, then look it up.');
      return;
    }
    setLocating(true);
    setError(null);
    try {
      const found = await geocodePlace(query);
      if (found.length === 0) {
        setError('Could not place that address. It will still save without a pin.');
        return;
      }
      setCoords({ lat: found[0].lat, lng: found[0].lng });
      setPinned(found[0].label);
    } catch {
      setError('Address lookup is unavailable right now.');
    } finally {
      setLocating(false);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError('Please give the mosque a name.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createMosque({
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        province: province || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        notes: notes.trim() || undefined,
        lat: coords?.lat,
        lng: coords?.lng,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that mosque.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="m-name" className={label}>
          Name
        </label>
        <input
          id="m-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="m-address" className={label}>
          Address <span className="font-normal text-basirah-teal/40">(optional)</span>
        </label>
        <input
          id="m-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
        <div>
          <label htmlFor="m-city" className={label}>
            City <span className="font-normal text-basirah-teal/40">(optional)</span>
          </label>
          <input
            id="m-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="m-province" className={label}>
            Province
          </label>
          <select
            id="m-province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className={field}
          >
            <option value="">—</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-basirah-teal/12 bg-basirah-cream/50 p-4">
        <p className="text-sm font-medium text-basirah-teal">Where is it on the map?</p>
        <p className="mt-1 text-xs leading-relaxed text-basirah-teal/55">
          {pinned
            ? `Pinned to ${pinned}. Tap the map to move it.`
            : 'Tap the map to drop a pin, or look it up from the address below.'}
        </p>

        {coords && (
          <div className="mt-3 h-52 overflow-hidden rounded-lg border border-basirah-teal/10">
            <Map
              initialViewState={{ longitude: coords.lng, latitude: coords.lat, zoom: 14 }}
              mapStyle="https://tiles.openfreemap.org/styles/liberty"
              style={{ width: '100%', height: '100%' }}
              onClick={(event) => {
                setCoords({ lat: event.lngLat.lat, lng: event.lngLat.lng });
                setPinned('the spot you chose');
              }}
            >
              <Marker longitude={coords.lng} latitude={coords.lat} anchor="bottom">
                <img src="/icons/masjid-pin.png" alt="" width={23} height={29} />
              </Marker>
            </Map>
          </div>
        )}

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-3"
          onClick={() => void findAddress()}
          disabled={locating}
        >
          {locating ? 'Looking up…' : 'Find from address'}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="m-phone" className={label}>
            Phone <span className="font-normal text-basirah-teal/40">(optional)</span>
          </label>
          <input
            id="m-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="m-website" className={label}>
            Website <span className="font-normal text-basirah-teal/40">(optional)</span>
          </label>
          <input
            id="m-website"
            type="url"
            placeholder="https://"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="m-notes" className={label}>
          Anything else <span className="font-normal text-basirah-teal/40">(optional)</span>
        </label>
        <textarea
          id="m-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={field}
        />
      </div>

      {error && <p className="text-sm text-basirah-rust">{error}</p>}

      <p className="text-xs leading-relaxed text-basirah-teal/45">
        It is added to your profile right away. It joins the public directory once someone has
        confirmed the details.
      </p>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Add mosque'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
