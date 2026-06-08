-- One-time backfill: link existing auth users to pending co-educator invites
-- Run in Supabase SQL Editor after 008_collaborator_invite_trigger.sql
--
-- Use this for sub-accounts that signed up BEFORE the trigger was installed.

insert into public.educator_collaborators (owner_id, collaborator_id)
select distinct ei.inviter_id, u.id
from public.educator_invites ei
inner join auth.users u
  on lower(trim(u.email)) = lower(trim(ei.invitee_email))
where ei.accepted_at is null
on conflict (owner_id, collaborator_id) do nothing;

update public.educator_invites ei
set accepted_at = now()
from auth.users u
where lower(trim(u.email)) = lower(trim(ei.invitee_email))
  and ei.accepted_at is null;

-- Mark invites accepted when a collaborator row already exists (partial failures)
update public.educator_invites ei
set accepted_at = now()
where ei.accepted_at is null
  and exists (
    select 1
    from auth.users u
    inner join public.educator_collaborators ec
      on ec.collaborator_id = u.id
     and ec.owner_id = ei.inviter_id
    where lower(trim(u.email)) = lower(trim(ei.invitee_email))
  );
