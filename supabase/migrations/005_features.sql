-- Share tokens, semester summaries, co-educators — run in Supabase SQL Editor

create extension if not exists "pgcrypto";

-- ─── Co-educator invites & collaborators (first — referenced by other policies) ───
create table if not exists educator_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users (id) on delete cascade,
  invitee_email text not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists educator_collaborators (
  owner_id uuid not null references auth.users (id) on delete cascade,
  collaborator_id uuid not null references auth.users (id) on delete cascade,
  primary key (owner_id, collaborator_id)
);

create index if not exists educator_invites_invitee_email_idx
  on educator_invites (lower(invitee_email));

alter table educator_invites enable row level security;
alter table educator_collaborators enable row level security;

create or replace function public.can_access_educator_workspace(owner uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = owner
    or exists (
      select 1 from educator_collaborators ec
      where ec.owner_id = owner and ec.collaborator_id = auth.uid()
    );
$$;

-- ─── Share tokens ───
create table if not exists share_tokens (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references observations (id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

create index if not exists share_tokens_token_idx on share_tokens (token);
create index if not exists share_tokens_observation_id_idx on share_tokens (observation_id);

alter table share_tokens enable row level security;

-- ─── Child summaries ───
create table if not exists child_summaries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  summary_text text not null,
  observation_count integer not null,
  created_at timestamptz not null default now()
);

create index if not exists child_summaries_child_id_idx on child_summaries (child_id);

alter table child_summaries enable row level security;

-- ─── Update children RLS for collaborators ───
drop policy if exists "educators_select_own_children" on children;
create policy "educators_select_own_children"
  on children for select
  using (public.can_access_educator_workspace(educator_id));

drop policy if exists "educators_insert_own_children" on children;
create policy "educators_insert_own_children"
  on children for insert
  with check (auth.uid() = educator_id);

drop policy if exists "educators_update_own_children" on children;
create policy "educators_update_own_children"
  on children for update
  using (auth.uid() = educator_id);

drop policy if exists "educators_delete_own_children" on children;
create policy "educators_delete_own_children"
  on children for delete
  using (auth.uid() = educator_id);

-- ─── Observations RLS ───
drop policy if exists "educators_select_own_observations" on observations;
create policy "educators_select_own_observations"
  on observations for select
  using (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and public.can_access_educator_workspace(children.educator_id)
    )
    or exists (
      select 1 from share_tokens st
      where st.observation_id = observations.id
        and st.expires_at > now()
    )
  );

drop policy if exists "educators_insert_own_observations" on observations;
create policy "educators_insert_own_observations"
  on observations for insert
  with check (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

drop policy if exists "educators_update_own_observations" on observations;
create policy "educators_update_own_observations"
  on observations for update
  using (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

drop policy if exists "educators_delete_own_observations" on observations;
create policy "educators_delete_own_observations"
  on observations for delete
  using (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and children.educator_id = auth.uid()
    )
  );

-- ─── Reflections RLS ───
drop policy if exists "educators_select_own_reflections" on reflections;
create policy "educators_select_own_reflections"
  on reflections for select
  using (
    exists (
      select 1 from observations
      join children on children.id = observations.child_id
      where observations.id = reflections.observation_id
        and public.can_access_educator_workspace(children.educator_id)
    )
    or exists (
      select 1 from share_tokens st
      where st.observation_id = reflections.observation_id
        and st.expires_at > now()
    )
  );

drop policy if exists "educators_insert_own_reflections" on reflections;
create policy "educators_insert_own_reflections"
  on reflections for insert
  with check (
    exists (
      select 1 from observations
      join children on children.id = observations.child_id
      where observations.id = reflections.observation_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

drop policy if exists "educators_delete_own_reflections" on reflections;
create policy "educators_delete_own_reflections"
  on reflections for delete
  using (
    exists (
      select 1 from observations
      join children on children.id = observations.child_id
      where observations.id = reflections.observation_id
        and children.educator_id = auth.uid()
    )
  );

-- ─── Child reflections RLS ───
drop policy if exists "educators_select_own_child_reflections" on child_reflections;
create policy "educators_select_own_child_reflections"
  on child_reflections for select
  using (
    exists (
      select 1 from children
      where children.id = child_reflections.child_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

drop policy if exists "educators_insert_own_child_reflections" on child_reflections;
create policy "educators_insert_own_child_reflections"
  on child_reflections for insert
  with check (
    exists (
      select 1 from children
      where children.id = child_reflections.child_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

drop policy if exists "educators_delete_own_child_reflections" on child_reflections;
create policy "educators_delete_own_child_reflections"
  on child_reflections for delete
  using (
    exists (
      select 1 from children
      where children.id = child_reflections.child_id
        and children.educator_id = auth.uid()
    )
  );

-- ─── Share token policies ───
create policy "educators_insert_share_tokens"
  on share_tokens for insert
  with check (
    exists (
      select 1 from observations
      join children on children.id = observations.child_id
      where observations.id = share_tokens.observation_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

create policy "educators_select_own_share_tokens"
  on share_tokens for select
  using (
    exists (
      select 1 from observations
      join children on children.id = observations.child_id
      where observations.id = share_tokens.observation_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

create policy "public_read_valid_share_tokens"
  on share_tokens for select
  using (expires_at > now());

-- ─── Child summaries RLS ───
create policy "educators_select_child_summaries"
  on child_summaries for select
  using (
    exists (
      select 1 from children
      where children.id = child_summaries.child_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

create policy "educators_insert_child_summaries"
  on child_summaries for insert
  with check (
    exists (
      select 1 from children
      where children.id = child_summaries.child_id
        and public.can_access_educator_workspace(children.educator_id)
    )
  );

create policy "educators_delete_child_summaries"
  on child_summaries for delete
  using (
    exists (
      select 1 from children
      where children.id = child_summaries.child_id
        and children.educator_id = auth.uid()
    )
  );

-- ─── Educator invites RLS ───
create policy "inviters_manage_own_invites"
  on educator_invites for all
  using (inviter_id = auth.uid())
  with check (inviter_id = auth.uid());

create policy "invitees_read_own_invites"
  on educator_invites for select
  using (lower(invitee_email) = lower(auth.jwt() ->> 'email'));

create policy "invitees_accept_own_invites"
  on educator_invites for update
  using (lower(invitee_email) = lower(auth.jwt() ->> 'email'))
  with check (lower(invitee_email) = lower(auth.jwt() ->> 'email'));

-- ─── Educator collaborators RLS ───
create policy "collaborators_select_own_rows"
  on educator_collaborators for select
  using (owner_id = auth.uid() or collaborator_id = auth.uid());

create policy "collaborators_insert_on_accept"
  on educator_collaborators for insert
  with check (
    collaborator_id = auth.uid()
    and exists (
      select 1 from educator_invites ei
      where ei.inviter_id = owner_id
        and lower(ei.invitee_email) = lower(auth.jwt() ->> 'email')
        and ei.accepted_at is null
    )
  );

create policy "owners_delete_collaborators"
  on educator_collaborators for delete
  using (owner_id = auth.uid());
