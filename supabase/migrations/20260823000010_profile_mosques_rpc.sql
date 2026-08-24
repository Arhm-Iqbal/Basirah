-- The mosques a member has added, with coordinates. Needed because the public directory
-- deliberately hides their unverified additions, but their own map must still show them.
-- security definer, and scoped to auth.uid() inside the function rather than by argument,
-- so it cannot be called with someone else's profile id.
create or replace function public.profile_mosques()
returns table (
  id          uuid,
  name        text,
  lat         double precision,
  lng         double precision,
  address     text,
  city        text,
  province    text,
  phone       text,
  website     text,
  source      text,
  verified_at timestamptz,
  added_at    timestamptz
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select m.id,
         m.name,
         st_y(m.location::geometry) as lat,
         st_x(m.location::geometry) as lng,
         m.address,
         m.city,
         m.province,
         m.phone,
         m.website,
         m.source,
         m.verified_at,
         mem.created_at as added_at
  from memberships mem
  join mosques m on m.id = mem.mosque_id
  where mem.profile_id = auth.uid()
  order by mem.created_at;
$$;

revoke execute on function public.profile_mosques() from public;
grant execute on function public.profile_mosques() to authenticated;
