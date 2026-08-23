create table communities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  province   text check (province in
               ('AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT')),
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mosques (
  id              uuid primary key default gen_random_uuid(),
  community_id    uuid references communities (id) on delete set null,
  name            text not null,
  location        extensions.geography(Point, 4326),
  address         text,
  city            text,
  province        text,
  postal_code     text,
  phone           text,
  website         text,

  -- Provenance. osm_id is the seed identity; google_place_id is the only Places field
  -- we may legally persist. Everything else Google returns is cached in KV under a
  -- 30-day TTL and must never be written into this table.
  osm_id          text unique,
  google_place_id text unique,
  source          text not null default 'osm'
                    check (source in ('osm', 'manual', 'admin_claim')),

  claimed_by      uuid references profiles (id) on delete set null,
  verified_at     timestamptz,
  details         jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index mosques_location_idx on mosques using gist (location);
create index mosques_city_idx on mosques (city);

create table memberships (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  mosque_id  uuid not null references mosques (id) on delete cascade,
  role       text not null default 'member'
               check (role in ('member', 'mosque_admin', 'security_officer',
                               'regional_coordinator')),
  created_at timestamptz not null default now(),
  unique (profile_id, mosque_id)
);

create index memberships_mosque_idx on memberships (mosque_id);

-- Defined here rather than with the other helpers because a `language sql` body is
-- validated at creation time, so memberships must already exist.
-- security definer so RLS on memberships cannot recurse into the policies that call it.
-- search_path is pinned: an unpinned definer function is a privilege-escalation vector.
create or replace function public.has_mosque_role(target_mosque uuid, allowed_roles text[])
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from memberships m
    where m.profile_id = auth.uid()
      and m.mosque_id = target_mosque
      and m.role = any(allowed_roles)
  );
$$;

revoke execute on function public.has_mosque_role(uuid, text[]) from public;
grant execute on function public.has_mosque_role(uuid, text[]) to authenticated;

create trigger communities_set_updated_at
  before update on communities
  for each row execute function public.set_updated_at();

create trigger mosques_set_updated_at
  before update on mosques
  for each row execute function public.set_updated_at();

alter table communities enable row level security;
alter table mosques enable row level security;
alter table memberships enable row level security;

-- The mosque directory is a public good: readable without an account, so someone can
-- find help before deciding whether to sign up. Writes are service-role only.
create policy communities_public_read on communities
  for select to anon, authenticated using (true);

create policy mosques_public_read on mosques
  for select to anon, authenticated using (true);

create policy memberships_select_own on memberships
  for select to authenticated
  using (profile_id = auth.uid());

create policy memberships_select_as_staff on memberships
  for select to authenticated
  using (public.has_mosque_role(mosque_id, array['mosque_admin', 'regional_coordinator']));
