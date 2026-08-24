-- Evidence attached to a report. The bucket is private and stays private: every read is a
-- short-lived signed URL minted by the Worker, so an object key on its own grants nothing.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'incident-media',
  'incident-media',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create table incident_media (
  id           uuid primary key default gen_random_uuid(),
  incident_id  uuid not null references incidents (id) on delete cascade,
  storage_path text not null unique,
  mime_type    text,
  size_bytes   int,
  created_at   timestamptz not null default now()
);

create index incident_media_incident_idx on incident_media (incident_id);

alter table incident_media enable row level security;

-- SELECT only, matching incidents. Uploads are trust-bearing writes and go through the Worker
-- on the service role, so no INSERT/UPDATE/DELETE policy exists for authenticated.
create policy incident_media_select_own on incident_media
  for select to authenticated
  using (
    exists (
      select 1 from incidents i
      where i.id = incident_media.incident_id
        and i.reporter_id = auth.uid()
    )
  );

-- Defence in depth on the objects themselves. Paths are '<incident_id>/<media_id>'; the regex
-- makes the uuid cast total, so a malformed key yields null and matches nothing rather than
-- raising and taking the whole query with it.
create policy incident_media_objects_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'incident-media'
    and exists (
      select 1 from incidents i
      where i.id = nullif(substring(storage.objects.name from '^([0-9a-fA-F-]{36})/'), '')::uuid
        and i.reporter_id = auth.uid()
    )
  );
