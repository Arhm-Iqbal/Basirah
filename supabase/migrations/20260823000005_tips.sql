-- The anonymous reporting path.
--
-- There is deliberately no reporter_id, no user_id, no ip_address, and no user_agent
-- column on this table, and they are absent rather than nullable. A nullable column
-- invites a later backfill; an absent one makes the guarantee structural. If a future
-- change appears to need one, that change is wrong.
--
-- Supabase signInAnonymously() is NOT used for this path. It mints a persistent
-- auth.users row, which is pseudonymity, not anonymity. Tips arrive with no JWT at all.

create table tips (
  id              uuid primary key default gen_random_uuid(),
  mosque_id       uuid references mosques (id) on delete set null,

  channel         text not null check (channel in ('online', 'in_person')),

  category        text check (category in
                    ('vandalism', 'threat', 'assault', 'harassment', 'intimidation',
                     'property_damage', 'online_hate', 'other')),

  status          text not null default 'submitted'
                    check (status in ('submitted', 'triaged', 'verified', 'alerted',
                                      'resolved', 'false_alarm')),

  occurred_at     timestamptz,
  location        extensions.geography(Point, 4326),
  description     text,
  details         jsonb not null default '{}'::jsonb,

  -- Hashed like a password. A leaked table must not let anyone enumerate the status of
  -- reports they did not file. The plaintext code is shown to the reporter exactly once
  -- and is never stored.
  claim_code_hash text not null,

  -- Unverified tips auto-expire on a scheduled job, per the ethical constraints.
  expires_at      timestamptz not null default (now() + interval '90 days'),

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index tips_status_idx on tips (status);
create index tips_expires_idx on tips (expires_at);
create index tips_claim_code_idx on tips (claim_code_hash);
create index tips_location_idx on tips using gist (location);

create trigger tips_set_updated_at
  before update on tips
  for each row execute function public.set_updated_at();

alter table tips enable row level security;

-- No policies at all. The absence IS the policy: anon and authenticated can neither read
-- nor write this table under any condition. Submission and claim-code status lookup both
-- go through the Worker on the service role, which bypasses RLS. Adding a SELECT policy
-- here would expose every anonymous report in the system.
