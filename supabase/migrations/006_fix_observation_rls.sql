-- Fix observation SELECT after insert (404 on /observations/[id])
-- Run in Supabase SQL Editor after 005_features.sql

-- Direct educator ownership for SELECT (replaces combined policy that can fail)
drop policy if exists "educators_select_own_observations" on observations;
create policy "educators_select_own_observations"
  on observations for select
  using (
    exists (
      select 1 from public.children c
      where c.id = observations.child_id
        and c.educator_id = auth.uid()
    )
  );

-- Collaborator read access (safe if educator_collaborators missing — policy never matches)
drop policy if exists "collaborators_select_observations" on observations;
create policy "collaborators_select_observations"
  on observations for select
  using (
    exists (
      select 1 from public.children c
      inner join public.educator_collaborators ec
        on ec.owner_id = c.educator_id
       and ec.collaborator_id = auth.uid()
      where c.id = observations.child_id
    )
  );

-- Share-link read access (requires share_tokens from 005)
drop policy if exists "share_token_select_observations" on observations;
create policy "share_token_select_observations"
  on observations for select
  using (
    exists (
      select 1 from public.share_tokens st
      where st.observation_id = observations.id
        and st.expires_at > now()
    )
  );

-- Direct educator ownership for INSERT
drop policy if exists "educators_insert_own_observations" on observations;
create policy "educators_insert_own_observations"
  on observations for insert
  with check (
    exists (
      select 1 from public.children c
      where c.id = observations.child_id
        and c.educator_id = auth.uid()
    )
  );

drop policy if exists "collaborators_insert_observations" on observations;
create policy "collaborators_insert_observations"
  on observations for insert
  with check (
    exists (
      select 1 from public.children c
      inner join public.educator_collaborators ec
        on ec.owner_id = c.educator_id
       and ec.collaborator_id = auth.uid()
      where c.id = observations.child_id
    )
  );
