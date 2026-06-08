-- Fix children SELECT (observation page loads child separately — 006 only fixed observations)
-- Run in Supabase SQL Editor after 006_fix_observation_rls.sql

drop policy if exists "educators_select_own_children" on children;
create policy "educators_select_own_children"
  on children for select
  using (educator_id = auth.uid());

drop policy if exists "collaborators_select_children" on children;
create policy "collaborators_select_children"
  on children for select
  using (
    exists (
      select 1 from public.educator_collaborators ec
      where ec.owner_id = children.educator_id
        and ec.collaborator_id = auth.uid()
    )
  );
