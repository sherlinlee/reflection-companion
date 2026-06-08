-- Auto-link co-educators when an invitee signs up
-- Run in Supabase SQL Editor after 007_fix_children_rls.sql

create or replace function public.handle_collaborator_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    return new;
  end if;

  -- Link every pending invite for this email (multiple educators may invite the same person)
  insert into public.educator_collaborators (owner_id, collaborator_id)
  select inviter_id, new.id
  from public.educator_invites
  where lower(invitee_email) = lower(new.email)
    and accepted_at is null
  on conflict do nothing;

  update public.educator_invites
  set accepted_at = now()
  where lower(invitee_email) = lower(new.email)
    and accepted_at is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_invite on auth.users;

create trigger on_auth_user_created_invite
  after insert on auth.users
  for each row
  execute function public.handle_collaborator_invite();

-- ─── Verify collaborator SELECT policies (006 / 007) ───
-- Observations: collaborators join children.educator_id → educator_collaborators
drop policy if exists "collaborators_select_observations" on observations;
create policy "collaborators_select_observations"
  on observations for select
  using (
    exists (
      select 1
      from public.children c
      inner join public.educator_collaborators ec
        on ec.owner_id = c.educator_id
       and ec.collaborator_id = auth.uid()
      where c.id = observations.child_id
    )
  );

-- Children: collaborators match owner_id to children.educator_id
drop policy if exists "collaborators_select_children" on children;
create policy "collaborators_select_children"
  on children for select
  using (
    exists (
      select 1
      from public.educator_collaborators ec
      where ec.owner_id = children.educator_id
        and ec.collaborator_id = auth.uid()
    )
  );
