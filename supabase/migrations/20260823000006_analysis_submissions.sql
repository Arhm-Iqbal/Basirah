-- Feature: paste a link or text, get an assessment plus credible coverage.
--
-- submitted_by is nullable here, unlike tips. The distinction is deliberate: a tip is a
-- person reporting something that happened to them, so identity must be structurally
-- absent. This is a question about a public URL, so attribution is optional and the
-- submitter may opt in to keep a history.

create table analysis_submissions (
  id           uuid primary key default gen_random_uuid(),
  submitted_by uuid references profiles (id) on delete set null,

  url          text,
  source_text  text,

  -- Dedupe key. Two people submitting the same video should hit cache, not re-bill a
  -- model call. Set from the normalized url, or a hash of source_text when url is null.
  content_hash text not null,

  content_type text check (content_type in ('article', 'video', 'social', 'text')),

  status       text not null default 'pending'
                 check (status in ('pending', 'analyzing', 'complete', 'failed')),

  -- Claude's structured output: category, severity, confidence, rationale, plus the
  -- credible sources retrieved. Left as jsonb until the taxonomy is pinned down.
  verdict      jsonb not null default '{}'::jsonb,

  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint analysis_has_input check (url is not null or source_text is not null)
);

create index analysis_content_hash_idx on analysis_submissions (content_hash);
create index analysis_submitted_by_idx on analysis_submissions (submitted_by);
create index analysis_status_idx on analysis_submissions (status);

create trigger analysis_submissions_set_updated_at
  before update on analysis_submissions
  for each row execute function public.set_updated_at();

alter table analysis_submissions enable row level security;

create policy analysis_select_own on analysis_submissions
  for select to authenticated
  using (submitted_by is not null and submitted_by = auth.uid());
