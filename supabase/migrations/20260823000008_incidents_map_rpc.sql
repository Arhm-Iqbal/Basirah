-- What the community map shows to everyone.
--
-- Three deliberate omissions: reporter_id never leaves the database, the free-text
-- description is not exposed (that is where identifying detail leaks), and coordinates
-- are rounded to roughly 100 m so a pin cannot single out a house.
--
-- security definer is load-bearing: incidents is RLS deny-by-default, so a plain
-- function would run as anon and return nothing. This function IS the boundary --
-- it bypasses RLS and hands back only the curated columns below.
--
-- Only verified incidents appear. An unverified report is visible to its own author
-- through RLS on the incidents table, never here -- verification gates broadcast.
create or replace function public.incidents_map(
  in_lat      double precision,
  in_lng      double precision,
  in_radius_m integer default 50000,
  in_limit    integer default 200
)
returns table (
  id          uuid,
  category    text,
  channel     text,
  lat         double precision,
  lng         double precision,
  occurred_at timestamptz,
  created_at  timestamptz
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select i.id,
         i.category,
         i.channel,
         round(st_y(i.location::geometry)::numeric, 3)::double precision as lat,
         round(st_x(i.location::geometry)::numeric, 3)::double precision as lng,
         i.occurred_at,
         i.created_at
  from incidents i
  where i.location is not null
    and i.status in ('verified', 'alerted', 'resolved')
    and st_dwithin(
          i.location,
          st_setsrid(st_makepoint(in_lng, in_lat), 4326)::geography,
          greatest(in_radius_m, 0)
        )
  order by i.created_at desc
  limit least(greatest(in_limit, 1), 500);
$$;

revoke execute on function public.incidents_map(double precision, double precision, integer, integer)
  from public;
grant execute on function public.incidents_map(double precision, double precision, integer, integer)
  to anon, authenticated;
