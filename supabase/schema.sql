-- Documentation Reflection Companion — run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists children (
  id uuid primary key default gen_random_uuid(),
  educator_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  age integer,
  class_name text,
  created_at timestamptz not null default now()
);

create table if not exists observations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children (id) on delete cascade,
  observation_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists reflections (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references observations (id) on delete cascade,
  patterns jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  connections jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists children_educator_id_idx on children (educator_id);
create index if not exists observations_child_id_idx on observations (child_id);
create index if not exists reflections_observation_id_idx on reflections (observation_id);

alter table children enable row level security;
alter table observations enable row level security;
alter table reflections enable row level security;

-- Children: educators see only their own
create policy "educators_select_own_children"
  on children for select
  using (auth.uid() = educator_id);

create policy "educators_insert_own_children"
  on children for insert
  with check (auth.uid() = educator_id);

create policy "educators_update_own_children"
  on children for update
  using (auth.uid() = educator_id);

create policy "educators_delete_own_children"
  on children for delete
  using (auth.uid() = educator_id);

-- Observations: via child ownership
create policy "educators_select_own_observations"
  on observations for select
  using (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and children.educator_id = auth.uid()
    )
  );

create policy "educators_insert_own_observations"
  on observations for insert
  with check (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and children.educator_id = auth.uid()
    )
  );

create policy "educators_update_own_observations"
  on observations for update
  using (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and children.educator_id = auth.uid()
    )
  );

create policy "educators_delete_own_observations"
  on observations for delete
  using (
    exists (
      select 1 from children
      where children.id = observations.child_id
        and children.educator_id = auth.uid()
    )
  );

-- Reflections: via observation → child ownership
create policy "educators_select_own_reflections"
  on reflections for select
  using (
    exists (
      select 1 from observations
      join children on children.id = observations.child_id
      where observations.id = reflections.observation_id
        and children.educator_id = auth.uid()
    )
  );

create policy "educators_insert_own_reflections"
  on reflections for insert
  with check (
    exists (
      select 1 from observations
      join children on children.id = observations.child_id
      where observations.id = reflections.observation_id
        and children.educator_id = auth.uid()
    )
  );

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

-- Reflections across all of a child's documentation
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
