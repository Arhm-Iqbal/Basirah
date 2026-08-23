create table incidents (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles (id) on delete cascade,
  mosque_id   uuid references mosques (id) on delete set null,

  -- The online / in_person split drives which fields the form requires and which
  -- response path the report takes. Kept as the one structural fact we are sure of.
  channel     text not null check (channel in ('online', 'in_person')),

  -- Provisional. Statistics Canada hate-crime classifications get pinned down once the
  -- report form exists; replacing a CHECK is one statement, unlike an enum type.
  category    text check (category in
                ('vandalism', 'threat', 'assault', 'harassment', 'intimidation',
                 'property_damage', 'online_hate', 'other')),

  status      text not null default 'submitted'
                check (status in ('submitted', 'triaged', 'verified', 'alerted',
                                  'resolved', 'false_alarm')),

  occurred_at timestamptz,
  location    extensions.geography(Point, 4326),
  description text,

  -- Everything the form collects that has not stabilized yet. Promote fields out of
  -- here into real columns once the frontend settles.
  details     jsonb not null default '{}'::jsonb,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index incidents_reporter_idx on incidents (reporter_id);
create index incidents_mosque_idx on incidents (mosque_id);
create index incidents_status_idx on incidents (status);
create index incidents_location_idx on incidents using gist (location);

create trigger incidents_set_updated_at
  before update on incidents
  for each row execute function public.set_updated_at();

alter table incidents enable row level security;

-- SELECT policies only, deliberately. Submission, verification, and status transitions
-- are trust-bearing writes and go through the Worker on the service role, per CLAUDE.md.
-- No INSERT/UPDATE/DELETE policy means the anon and authenticated roles cannot write here.
create policy incidents_select_own on incidents
  for select to authenticated
  using (reporter_id = auth.uid());

create policy incidents_select_as_staff on incidents
  for select to authenticated
  using (
    mosque_id is not null
    and public.has_mosque_role(mosque_id,
          array['mosque_admin', 'security_officer', 'regional_coordinator'])
  );
