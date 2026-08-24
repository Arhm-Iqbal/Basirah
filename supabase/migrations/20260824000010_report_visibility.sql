-- A reporter may remove a report from their own account without destroying the community
-- record. Permanent deletion remains a separate, explicit API action.
alter table incidents
  add column reporter_hidden_at timestamptz;

create index incidents_visible_to_reporter_idx
  on incidents (reporter_id, created_at desc)
  where reporter_hidden_at is null;

-- Hidden reports remain available to authorized staff through the separate staff policy,
-- but the reporter can no longer read the incident or its files directly.
drop policy incidents_select_own on incidents;
create policy incidents_select_own on incidents
  for select to authenticated
  using (reporter_id = auth.uid() and reporter_hidden_at is null);

drop policy incident_media_select_own on incident_media;
create policy incident_media_select_own on incident_media
  for select to authenticated
  using (
    exists (
      select 1 from incidents i
      where i.id = incident_media.incident_id
        and i.reporter_id = auth.uid()
        and i.reporter_hidden_at is null
    )
  );

drop policy incident_media_objects_select_own on storage.objects;
create policy incident_media_objects_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'incident-media'
    and exists (
      select 1 from incidents i
      where i.id = nullif(substring(storage.objects.name from '^([0-9a-fA-F-]{36})/'), '')::uuid
        and i.reporter_id = auth.uid()
        and i.reporter_hidden_at is null
    )
  );

drop policy report_documents_select_own on report_documents;
create policy report_documents_select_own on report_documents
  for select to authenticated
  using (
    exists (
      select 1 from incidents i
      where i.id = report_documents.incident_id
        and i.reporter_id = auth.uid()
        and i.reporter_hidden_at is null
    )
  );
