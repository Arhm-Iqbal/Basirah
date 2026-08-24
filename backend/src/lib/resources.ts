import type { SupabaseClient } from '@supabase/supabase-js';

export type SupportResource = {
  id: string;
  name: string;
  kind: string | null;
  province: string | null;
  scope: string | null;
  description: string | null;
  url: string | null;
  phone: string | null;
};

// Enough for the model to pick from without letting the candidate list crowd out the
// incident itself in the prompt.
const CANDIDATE_LIMIT = 16;

// mosques.province is free text, and the value reaches a PostgREST filter string below.
// Anything not on this list is treated as no province rather than interpolated.
const PROVINCES = new Set([
  'AB',
  'BC',
  'MB',
  'NB',
  'NL',
  'NS',
  'NT',
  'NU',
  'ON',
  'PE',
  'QC',
  'SK',
  'YT',
]);

const KIND_ORDER = [
  'police_non_emergency',
  'victim_services',
  'crisis_line',
  'human_rights',
  'legal_clinic',
  'reporting_body',
  'community_org',
];

function rank(resource: SupportResource): [number, number, string] {
  const local = resource.scope === 'federal' ? 1 : 0;
  const kind = KIND_ORDER.indexOf(resource.kind ?? '');
  return [local, kind === -1 ? KIND_ORDER.length : kind, resource.name];
}

// Candidates for one incident: federal bodies always, plus anything scoped to the
// reporter's province. A null province means we only know the country, so only the
// federal rows are safe to offer -- naming another province's tribunal is a wrong answer,
// not a partial one.
export async function findResources(
  db: SupabaseClient,
  province: string | null,
  category: string | null,
): Promise<SupportResource[]> {
  const code = province && PROVINCES.has(province.toUpperCase()) ? province.toUpperCase() : null;

  let query = db
    .from('support_resources')
    .select('id, name, kind, province, scope, description, url, phone');

  query = code ? query.or(`province.is.null,province.eq.${code}`) : query.is('province', null);

  if (category) query = query.contains('applies_to', [category]);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const resources = (data ?? []) as SupportResource[];

  return resources
    .sort((a, b) => {
      const [al, ak, an] = rank(a);
      const [bl, bk, bn] = rank(b);
      return al - bl || ak - bk || an.localeCompare(bn);
    })
    .slice(0, CANDIDATE_LIMIT);
}
