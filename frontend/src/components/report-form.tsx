'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { StatusBadge } from '@/components/status-badge';
import { createClient } from '@/lib/supabase/client';
import { useGeolocation } from '@/lib/use-geolocation';

type Channel = 'online' | 'in_person';

type Created = {
  id: string;
  status: string;
  claim_code?: string;
};

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

const fieldClass =
  'w-full rounded-md border border-basirah-teal/30 bg-white px-3.5 py-2.5 text-base text-basirah-teal outline-none transition-colors focus:border-basirah-teal';
const labelClass = 'block text-base font-semibold text-basirah-teal';

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
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const { coords, status: geoStatus, locate } = useGeolocation();

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setSignedIn(Boolean(data.session)))
      .catch(() => setSignedIn(false));
  }, []);

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

      // Without a session the report goes to the anonymous endpoint, which stores no
      // identity at all and hands back a claim code instead of a linkable record.
      if (!token) payload.turnstile_token = 'unconfigured';

      const response = await fetch(`${API_URL}${token ? '/v1/incidents' : '/v1/tips'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message = (body as { error?: { message?: string } } | null)?.error?.message;
        setError(message ?? 'Your report could not be submitted. Please try again.');
        return;
      }

      const incident = body as { id: string; status: string; claim_code?: string };
      setCreated({
        id: incident.id,
        status: incident.status,
        claim_code: incident.claim_code,
      });
    } catch {
      setError('Could not reach the Basirah API. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="rounded-lg border border-basirah-teal/20 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-basirah-teal">
            Report received
          </h2>
          <StatusBadge status={created.status} />
        </div>

        <p className="mt-3 text-base text-basirah-teal">
          Your report is with your community&apos;s verification team. Nothing is sent as a
          community-wide alert until a person has verified it.
        </p>
        {created.claim_code ? (
          <div className="mt-4 rounded-lg border border-basirah-rust/30 bg-basirah-rust/8 p-4">
            <p className="text-base font-semibold text-basirah-rust">Save this code</p>
            <p className="mt-1 text-sm text-basirah-teal">
              This is the only way to check on your report later.
            </p>
            <p className="mt-3 break-all font-mono text-lg tracking-widest text-basirah-teal sm:text-xl">
              {created.claim_code}
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-basirah-teal/70">Reference {created.id}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!created.claim_code && (
            <Link
              href="/app/reports"
              className="rounded-md bg-basirah-teal px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-basirah-teal/90"
            >
              View my reports
            </Link>
          )}
          <button
            type="button"
            onClick={reset}
            className="cursor-pointer rounded-md border border-basirah-teal/30 bg-white px-5 py-2.5 text-base font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream"
          >
            Submit another report
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {signedIn === false && (
        <p className="text-base text-basirah-teal">
          No account needed. You&apos;ll get a claim code after submitting.{' '}
          <Link href="/login" className="font-medium text-basirah-rust hover:text-basirah-rust/80">
            Log in
          </Link>{' '}
          to track reports in the app.
        </p>
      )}

      <fieldset>
        <legend className={labelClass}>Where did this happen?</legend>
        <div className="mt-3 flex w-full rounded-md border border-basirah-teal/30 bg-white p-0.5 sm:inline-flex sm:w-auto">
          {CHANNELS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setChannel(option.value)}
              aria-pressed={channel === option.value}
              className={`flex-1 cursor-pointer rounded-md px-4 py-2.5 text-base font-semibold transition-colors sm:flex-none sm:px-5 ${
                channel === option.value
                  ? 'bg-basirah-teal text-white'
                  : 'text-basirah-teal hover:bg-basirah-cream'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-4 rounded-lg border border-basirah-teal/20 bg-white p-4 sm:p-5">
        <div>
          <label htmlFor="description" className={labelClass}>
            What happened?
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            maxLength={10_000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={`mt-2 resize-y ${fieldClass}`}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
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
              When
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
                Platform
              </label>
              <input
                id="platform"
                name="platform"
                type="text"
                maxLength={100}
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className={`mt-2 ${fieldClass}`}
              />
            </div>

            <div>
              <label htmlFor="url" className={labelClass}>
                Link
              </label>
              <input
                id="url"
                name="url"
                type="url"
                maxLength={2000}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className={`mt-2 ${fieldClass}`}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <span className={labelClass}>Location</span>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocationCleared(false);
                    locate();
                  }}
                  disabled={geoStatus === 'locating'}
                  className="cursor-pointer rounded-md border border-basirah-teal/30 bg-white px-4 py-2.5 text-base font-semibold text-basirah-teal transition-colors hover:bg-basirah-cream disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {geoStatus === 'locating' ? 'Locating…' : 'Use my location'}
                </button>

                {activeCoords && (
                  <span className="inline-flex items-center gap-3 rounded-md border border-basirah-teal/20 bg-basirah-cream px-3 py-2 text-sm font-semibold text-basirah-teal">
                    Location added
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
                Describe the place
              </label>
              <input
                id="location_description"
                name="location_description"
                type="text"
                maxLength={500}
                value={locationDescription}
                onChange={(event) => setLocationDescription(event.target.value)}
                className={`mt-2 ${fieldClass}`}
              />
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-basirah-rust">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-md bg-basirah-rust px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-basirah-rust/90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting ? 'Submitting…' : 'Submit report'}
        </button>
      </div>
    </form>
  );
}
