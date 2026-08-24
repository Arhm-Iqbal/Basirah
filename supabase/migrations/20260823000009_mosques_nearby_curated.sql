-- Anyone can add a mosque they cannot find, which means mosques now holds unverified
-- user-submitted rows. The public directory shows only OSM-seeded or human-verified
-- entries; a member's own additions reach them through their membership, not through here.
-- Same rule as incidents: submission is open, broadcast is gated.
create or replace function public.mosques_nearby(
  in_lat      double precision,
  in_lng      double precision,
  in_radius_m integer default 25000,
  in_limit    integer default 20
)
returns table (
  id          uuid,
  name        text,
  lat         double precision,
  lng         double precision,
  address     text,
  city        text,
  province    text,
  postal_code text,
  phone       text,
  website     text,
  source      text,
  verified_at timestamptz,
  created_at  timestamptz,
  distance_m  double precision
)
language sql
stable
set search_path = public, extensions
as $$
  with origin as (
    select st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography as g
  )
  select m.id,
         m.name,
         st_y(m.location::geometry) as lat,
         st_x(m.location::geometry) as lng,
         m.address,
         m.city,
         m.province,
         m.postal_code,
         m.phone,
         m.website,
         m.source,
         m.verified_at,
         m.created_at,
         st_distance(m.location, origin.g) as distance_m
  from mosques m, origin
  where m.location is not null
    and (m.source <> 'manual' or m.verified_at is not null)
    and st_dwithin(m.location, origin.g, greatest(in_radius_m, 0))
  order by distance_m
  limit least(greatest(in_limit, 1), 100);
$$;

grant execute on function public.mosques_nearby(double precision, double precision, integer, integer)
  to anon, authenticated;
