-- Community members can suggest businesses and professionals for the curated directory.
-- A suggestion never becomes public merely because it was submitted: staff must first
-- check the evidence and deliberately approve it.
create table directory_submissions (
  id             uuid primary key default gen_random_uuid(),
  submitted_by   uuid references profiles (id) on delete set null,
  listing_type   text not null
                   check (listing_type in ('business', 'health_professional', 'lawyer')),
  name           text not null,
  category       text,
  role           text,
  specialty      text,
  organization   text,
  address        text,
  website        text,
  public_email   text,
  evidence       text not null,
  notes          text,
  status         text not null default 'pending'
                   check (status in ('pending', 'approved', 'rejected')),
  reviewed_by    uuid references profiles (id) on delete set null,
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint directory_submission_fields check (
    (listing_type = 'business' and nullif(btrim(category), '') is not null)
    or
    (listing_type in ('health_professional', 'lawyer')
      and nullif(btrim(role), '') is not null
      and nullif(btrim(specialty), '') is not null)
  )
);

create index directory_submissions_submitter_idx
  on directory_submissions (submitted_by, created_at desc);
create index directory_submissions_review_idx
  on directory_submissions (status, created_at);

create trigger directory_submissions_set_updated_at
  before update on directory_submissions
  for each row execute function public.set_updated_at();

alter table directory_submissions enable row level security;

-- Members can inspect their own suggestions. Inserts and review changes go through the
-- authenticated Worker, which uses the service role and never exposes it to the browser.
create policy directory_submissions_select_own on directory_submissions
  for select to authenticated
  using (submitted_by = auth.uid());
