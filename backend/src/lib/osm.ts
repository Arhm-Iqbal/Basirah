const OVERPASS = 'https://overpass-api.de/api/interpreter';

export type OsmMosque = {
  osm_id: string;
  name: string;
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  website: string | null;
};

// OSM data is ODbL, which permits storage and redistribution with attribution. That is
// why the directory is seeded from here rather than from Places, whose terms forbid it.
export async function fetchMosquesInBbox(
  south: number,
  west: number,
  north: number,
  east: number,
): Promise<OsmMosque[]> {
  const query = `[out:json][timeout:60];
nwr["amenity"="place_of_worship"]["religion"="muslim"](${south},${west},${north},${east});
out center;`;

  const res = await fetch(OVERPASS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }),
  });
  if (!res.ok) throw new Error(`Overpass returned ${res.status}`);

  const body = (await res.json()) as { elements?: Array<Record<string, any>> };

  return (body.elements ?? []).flatMap((el) => {
    const t = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null || !t.name) return [];

    const street = [t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' ');

    return [
      {
        osm_id: `${el.type}/${el.id}`,
        name: t.name as string,
        lat,
        lng,
        address: street || null,
        city: t['addr:city'] ?? null,
        postal_code: t['addr:postcode'] ?? null,
        phone: t.phone ?? t['contact:phone'] ?? null,
        website: t.website ?? t['contact:website'] ?? null,
      },
    ];
  });
}
