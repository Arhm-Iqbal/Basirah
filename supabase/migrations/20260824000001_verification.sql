-- The review queue: incidents still awaiting a decision, at the mosques where the caller
-- is staff. Verification gates broadcast, so this is the one read that decides what the
-- community eventually sees -- it must never widen beyond the caller's own mosques.
--
-- security definer is load-bearing: incidents is RLS deny-by-default and its staff SELECT
-- policy already exists, but this function also joins memberships, whose own policy would
-- otherwise recurse.
--
-- Scoped by auth.uid() inside the body rather than by an argument, so there is no
-- parameter to pass someone else's identity through.
create or replace function public.pending_incidents()
returns table (
  id          uuid,
  channel     text,
  category    text,
  status      text,
  description text,
  occurred_at timestamptz,
  created_at  timestamptz,
  mosque_id   uuid,
  mosque_name text
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select i.id,
         i.channel,
         i.category,
         i.status,
         i.description,
         i.occurred_at,
         i.created_at,
         i.mosque_id,
         m.name as mosque_name
  from incidents i
  join memberships mem
    on mem.mosque_id = i.mosque_id
   and mem.profile_id = auth.uid()
   and mem.role in ('mosque_admin', 'security_officer', 'regional_coordinator')
  join mosques m
    on m.id = i.mosque_id
  where i.status in ('submitted', 'triaged')
  order by i.created_at desc;
$$;

revoke execute on function public.pending_incidents() from public;
grant execute on function public.pending_incidents() to authenticated;
