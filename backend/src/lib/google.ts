import type { Bindings } from './env';

const PLACES = 'https://places.googleapis.com/v1/places:searchText';
const FACTCHECK = 'https://factchecktools.googleapis.com/v1alpha1/claims:search';

// Google licenses these fields for display but not for storage beyond 30 days, so they
// are cached and served live. Never write them onto the mosques row -- only place_id,
// which Google does allow us to keep.
const ENRICH_FIELDS = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours.weekdayDescriptions',
].join(',');

export type PlaceEnrichment = {
  place_id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: string[] | null;
};

export async function enrichFromPlaces(
  env: Bindings,
  query: string,
): Promise<PlaceEnrichment | null> {
  const res = await fetch(PLACES, {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': env.GOOGLE_API_KEY,
      'X-Goog-FieldMask': ENRICH_FIELDS,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { places?: Array<Record<string, any>> };
  const p = body.places?.[0];
  if (!p) return null;

  return {
    place_id: p.id,
    name: p.displayName?.text ?? null,
    address: p.formattedAddress ?? null,
    phone: p.nationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    opening_hours: p.regularOpeningHours?.weekdayDescriptions ?? null,
  };
}

export type FactCheckResult = { title: string; url: string; publisher: string | null };

export async function searchFactChecks(
  env: Bindings,
  query: string,
  limit = 5,
): Promise<FactCheckResult[]> {
  const url = new URL(FACTCHECK);
  url.searchParams.set('query', query);
  url.searchParams.set('languageCode', 'en');
  url.searchParams.set('pageSize', String(limit));
  url.searchParams.set('key', env.GOOGLE_API_KEY);

  const res = await fetch(url);
  if (!res.ok) return [];

  const body = (await res.json()) as { claims?: Array<Record<string, any>> };
  return (body.claims ?? []).flatMap((claim) =>
    (claim.claimReview ?? []).slice(0, 1).map((r: Record<string, any>) => ({
      title: r.title ?? claim.text ?? '',
      url: r.url ?? '',
      publisher: r.publisher?.name ?? null,
    })),
  );
}
