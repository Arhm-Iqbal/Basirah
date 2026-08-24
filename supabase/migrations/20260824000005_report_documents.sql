-- A generated PDF copy of each report, kept under the reporter's own profile.
--
-- Versioned rather than overwritten: editing a report supersedes its document instead of
-- mutating it, so a copy someone already downloaded still corresponds to a row we can
-- account for. The current document is simply the highest version.
create table report_documents (
  id           uuid primary key default gen_random_uuid(),
  incident_id  uuid not null references incidents (id) on delete cascade,
  storage_path text not null,
  version      integer not null default 1,
  byte_size    integer,
  created_at   timestamptz not null default now(),
  unique (incident_id, version)
);

create index report_documents_incident_idx on report_documents (incident_id, version desc);

alter table report_documents enable row level security;

-- Readable only by the reporter, resolved through the incident rather than stored here,
-- so this table never carries a second copy of who filed what.
create policy report_documents_select_own on report_documents
  for select to authenticated
  using (
    exists (
      select 1 from incidents i
      where i.id = report_documents.incident_id
        and i.reporter_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-documents', 'report-documents', false, 5242880, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = 5242880,
      allowed_mime_types = array['application/pdf'];

-- Objects are reachable only through signed URLs minted by the Worker. No storage policy
-- is granted to anon or authenticated, so the bucket is unreadable by the browser key.
