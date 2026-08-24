-- An appeal is a request to re-examine a report someone believes is wrong.
--
-- Deliberately open to any signed-in member, not just the reporter. A report that has been
-- verified is on the public map, and the person best placed to say it is mistaken is
-- usually not the one who filed it. Requiring the reporter to appeal their own report
-- would leave no route at all for the case this exists to cover.
create table incident_appeals (
  id           uuid primary key default gen_random_uuid(),
  incident_id  uuid not null references incidents (id) on delete cascade,
  submitted_by uuid not null references profiles (id) on delete cascade,
  reason       text not null,
  status       text not null default 'open' check (status in ('open', 'upheld', 'rejected')),
  resolution   text,
  resolved_by  uuid references profiles (id) on delete set null,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now(),
  -- One appeal per person per report. Without this, a single account can bury a report.
  unique (incident_id, submitted_by)
);

create index incident_appeals_status_idx on incident_appeals (status, created_at);
create index incident_appeals_incident_idx on incident_appeals (incident_id);

alter table incident_appeals enable row level security;

-- You can read the appeals you filed. Staff read them through the Worker on the service
-- role, the same way the verification queue works.
create policy incident_appeals_select_own on incident_appeals
  for select to authenticated
  using (submitted_by = auth.uid());

-- Appeals awaiting review, scoped to the mosques the caller staffs. Same shape and same
-- auth.uid() scoping as pending_incidents.
create or replace function public.pending_appeals()
returns table (
  id             uuid,
  incident_id    uuid,
  reason         text,
  created_at     timestamptz,
  incident_channel text,
  incident_category text,
  incident_status text,
  mosque_id      uuid,
  mosque_name    text
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select a.id,
         a.incident_id,
         a.reason,
         a.created_at,
         i.channel,
         i.category,
         i.status,
         i.mosque_id,
         m.name
  from incident_appeals a
  join incidents i on i.id = a.incident_id
  left join mosques m on m.id = i.mosque_id
  where a.status = 'open'
    and i.mosque_id is not null
    and exists (
      select 1 from memberships mem
      where mem.profile_id = auth.uid()
        and mem.mosque_id = i.mosque_id
        and mem.role in ('mosque_admin', 'security_officer', 'regional_coordinator')
    )
  order by a.created_at;
$$;

revoke execute on function public.pending_appeals() from public;
grant execute on function public.pending_appeals() to authenticated;
