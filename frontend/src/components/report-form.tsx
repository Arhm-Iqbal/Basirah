'use client';

import Link from 'next/link';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { useGeolocation } from '@/lib/use-geolocation';

type Channel = 'online' | 'in_person';

type Created = { id: string; status: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'in_person', label: 'In person' },
  { value: 'online', label: 'Online' },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'vandalism', label: 'Vandalism' },
  { value: 'threat', label: 'Threat' },
  { value: 'assault', label: 'Assault' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'intimidation', label: 'Intimidation' },
  { value: 'property_damage', label: 'Property damage' },
  { value: 'online_hate', label: 'Online hate' },
  { value: 'other', label: 'Other' },
];

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-basirah-teal/10 text-basirah-teal',
  triaged: 'bg-basirah-cyan text-basirah-teal',
  verified: 'bg-basirah-teal text-white',
  alerted: 'bg-basirah-rust text-white',
  resolved: 'bg-basirah-teal/5 text-basirah-teal/60',
  false_alarm: 'bg-basirah-teal/5 text-basirah-teal/50',
};

const fieldClass =
  'w-full rounded-xl border border-basirah-teal/15 bg-white px-4 py-3 text-sm text-basirah-teal outline-none transition-colors placeholder:text-basirah-teal/40 focus:border-basirah-teal/40';
const labelClass = 'block text-sm font-medium text-basirah-teal';
const hintClass = 'mt-1.5 text-xs text-basirah-teal/50';

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_STYLES[status] ?? 'bg-basirah-teal/5 text-basirah-teal/60'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function trimmed(value: string) {
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

export function ReportForm() {
  const [channel, setChannel] = useState<Channel>('in_person');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [occurredAt, setOccurredAt] = useState('');
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [locationCleared, setLocationCleared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);

  const { coords, status: geoStatus, locate } = useGeolocation();

  // useGeolocation owns coords and exposes no reset, so clearing is tracked here.
  const activeCoords = locationCleared ? null : coords;

  const reset = () => {
    setCreated(null);
    setDescription('');
    setCategory('');
    setOccurredAt('');
    setPlatform('');
    setUrl('');
    setLocationDescription('');
    setLocationCleared(true);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!API_URL) {
      setError('NEXT_PUBLIC_API_URL isn’t set. Add it to frontend/.env.local.');
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await createClient().auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setError('Your session has expired. Sign in again to submit this report.');
        return;
      }

      const payload: Record<string, unknown> = {
        channel,
        description: description.trim(),
        category: category || undefined,
        // datetime-local produces a zoneless local string; the contract is ISO 8601 with an offset.
        occurred_at: occurredAt ? new Date(occurredAt).toISOString() : undefined,
        details: {},
      };

      if (channel === 'online') {
        payload.platform = trimmed(platform);
        payload.url = trimmed(url);
      } else {
        payload.lat = activeCoords?.lat;
        payload.lng = activeCoords?.lng;
        payload.location_description = trimmed(locationDescription);
      }

      const response = await fetch(`${API_URL}/v1/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message = (body as { error?: { message?: string } } | null)?.error?.message;
        setError(message ?? 'Your report could not be submitted. Please try again.');
        return;
      }

      const incident = body as Created;
      setCreated({ id: incident.id, status: incident.status });
    } catch {
      setError('Could not reach the Basirah API. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-basirah-teal/5 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-basirah-teal">
            Report received
          </h2>
          <StatusBadge status={created.status} />
        </div>

        <p className="mt-3 text-sm text-basirah-teal/70">
          Your report is with your community&apos;s verification team. Nothing is sent as a
          community-wide alert until a person has verified it.
        </p>
        <p className="mt-2 text-xs text-basirah-teal/50">Reference {created.id}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/app/reports"
            className="rounded-full bg-basirah-teal px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-basirah-teal/90"
          >
            View my reports
          </Link>
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer rounded-full border border-basirah-teal/15 px-6 py-3 text-sm font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream"
          >
            Submit another report
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className={labelClass}>Where did this happen?</legend>
        <div className="mt-3 inline-flex rounded-full border border-basirah-teal/15 bg-white p-1">
          {CHANNELS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setChannel(option.value)}
              aria-pressed={channel === option.value}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                channel === option.value
                  ? 'bg-basirah-teal text-white'
                  : 'text-basirah-teal/70 hover:bg-basirah-teal/5 hover:text-basirah-teal'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-basirah-teal/5 sm:p-8">
        <div>
          <label htmlFor="description" className={labelClass}>
            What happened?
          </label>
          <p className={hintClass}>
            Describe what was said or done, and what happened before and after. Basirah records
            behaviour, not identity — leave out anyone&apos;s appearance, background, or faith.
          </p>
          <textarea
            id="description"
            name="description"
            required
            rows={7}
            maxLength={10_000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Someone shouted threats at people leaving the evening prayer, then followed them to the parking lot."
            className={`mt-2 resize-y ${fieldClass}`}
          />
          <p className="mt-1.5 text-end text-xs text-basirah-teal/40">
            {description.length.toLocaleString()} / 10,000
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category <span className="font-normal text-basirah-teal/50">(optional)</span>
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`mt-2 cursor-pointer ${fieldClass}`}
            >
              <option value="">Not sure</option>
              {CATEGORIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="occurred_at" className={labelClass}>
              When did it happen?{' '}
              <span className="font-normal text-basirah-teal/50">(optional)</span>
            </label>
            <input
              id="occurred_at"
              name="occurred_at"
              type="datetime-local"
              value={occurredAt}
              onChange={(event) => setOccurredAt(event.target.value)}
              className={`mt-2 ${fieldClass}`}
            />
          </div>
        </div>

        {channel === 'online' ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="platform" className={labelClass}>
                Platform <span className="font-normal text-basirah-teal/50">(optional)</span>
              </label>
              <input
                id="platform"
                name="platform"
                type="text"
                maxLength={100}
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                placeholder="Instagram, X, a community forum…"
                className={`mt-2 ${fieldClass}`}
              />
            </div>

            <div>
              <label htmlFor="url" className={labelClass}>
                Link <span className="font-normal text-basirah-teal/50">(optional)</span>
              </label>
              <input
                id="url"
                name="url"
                type="url"
                maxLength={2000}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://"
                className={`mt-2 ${fieldClass}`}
              />
              <p className={hintClass}>A link to the post or message, if it is still up.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className={labelClass}>
                Location <span className="font-normal text-basirah-teal/50">(optional)</span>
              </span>
              <p className={hintClass}>
                Coordinates help map where incidents cluster. They are never shown next to your
                name.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocationCleared(false);
                    locate();
                  }}
                  disabled={geoStatus === 'locating'}
                  className="cursor-pointer rounded-full border border-basirah-teal/15 px-5 py-2.5 text-sm font-medium text-basirah-teal transition-colors hover:bg-basirah-cream disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {geoStatus === 'locating' ? 'Locating…' : 'Use my location'}
                </button>

                {activeCoords && (
                  <span className="inline-flex items-center gap-3 rounded-full bg-basirah-teal/5 px-4 py-2 text-xs text-basirah-teal/70">
                    {activeCoords.lat.toFixed(5)}, {activeCoords.lng.toFixed(5)}
                    <button
                      type="button"
                      onClick={() => setLocationCleared(true)}
                      className="cursor-pointer font-medium text-basirah-rust transition-colors hover:text-basirah-rust/80"
                    >
                      Clear
                    </button>
                  </span>
                )}
              </div>

              {geoStatus === 'denied' && (
                <p className="mt-2 text-xs text-basirah-rust">
                  Location permission was denied. You can describe the place below instead.
                </p>
              )}
              {geoStatus === 'unavailable' && (
                <p className="mt-2 text-xs text-basirah-rust">
                  Your browser could not provide a location. You can describe the place below
                  instead.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="location_description" className={labelClass}>
                Describe the place{' '}
                <span className="font-normal text-basirah-teal/50">(optional)</span>
              </label>
              <input
                id="location_description"
                name="location_description"
                type="text"
                maxLength={500}
                value={locationDescription}
                onChange={(event) => setLocationDescription(event.target.value)}
                placeholder="Parking lot behind the masjid, near the east entrance"
                className={`mt-2 ${fieldClass}`}
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-basirah-rust">{error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-full bg-basirah-rust px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-basirah-rust/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Submitting…' : 'Submit report'}
        </button>
        <p className="text-xs text-basirah-teal/50">
          A person reviews every report before anything is broadcast.
        </p>
      </div>
    </form>
  );
}
