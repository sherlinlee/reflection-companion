-- Run in Supabase SQL Editor (project: xrqyfiirymicgkqwxyky)
-- Safe to run more than once

create table if not exists child_reflections (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  patterns jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  connections jsonb not null default '[]'::jsonb,
  observation_count integer not null,
  created_at timestamptz not null default now()
);

create index if not exists child_reflections_child_id_idx on child_reflections (child_id);

alter table child_reflections enable row level security;

drop policy if exists "educators_select_own_child_reflections" on child_reflections;
drop policy if exists "educators_insert_own_child_reflections" on child_reflections;
drop policy if exists "educators_delete_own_child_reflections" on child_reflections;

create policy "educators_select_own_child_reflections"
  on child_reflections for select
  using (
    exists (
      select 1 from children
      where children.id = child_reflections.child_id
        and children.educator_id = auth.uid()
    )
  );

create policy "educators_insert_own_child_reflections"
  on child_reflections for insert
  with check (
    exists (
      select 1 from children
      where children.id = child_reflections.child_id
        and children.educator_id = auth.uid()
    )
  );

create policy "educators_delete_own_child_reflections"
  on child_reflections for delete
  using (
    exists (
      select 1 from children
      where children.id = child_reflections.child_id
        and children.educator_id = auth.uid()
    )
  );
