create table mosque_events (
  id          uuid primary key default gen_random_uuid(),
  mosque_id   uuid not null references mosques (id) on delete cascade,
  title       text not null,
  description text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  url         text,
  source      text not null default 'admin' check (source in ('ics', 'scraped', 'admin')),
  source_ref  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (mosque_id, source_ref)
);

create index mosque_events_mosque_starts_idx on mosque_events (mosque_id, starts_at);

create trigger mosque_events_set_updated_at
  before update on mosque_events
  for each row execute function public.set_updated_at();

alter table mosque_events enable row level security;

-- Mosque events are public information, same posture as the directory itself.
create policy mosque_events_public_read on mosque_events
  for select to anon, authenticated using (true);

-- Past events are filtered, never deleted: the grant reporting will want the history.
-- The three-hour grace keeps something happening right now on screen.
create or replace function public.mosque_upcoming_events(in_mosque uuid)
returns table (
  id uuid,
  title text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  url text,
  source text
)
language sql
stable
set search_path = public
as $$
  select e.id, e.title, e.description, e.starts_at, e.ends_at, e.url, e.source
  from mosque_events e
  where e.mosque_id = in_mosque
    and (
      (e.ends_at is not null and e.ends_at >= now())
      or (e.ends_at is null and e.starts_at >= now() - interval '3 hours')
    )
  order by e.starts_at
  limit 20;
$$;

grant execute on function public.mosque_upcoming_events(uuid) to anon, authenticated;
