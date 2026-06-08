-- Pilot: per-educator media upload/delete audit trail (bytes, not file content)
-- Run in Supabase SQL Editor (safe to run more than once)

create table if not exists educator_storage_events (
  id uuid primary key default gen_random_uuid(),
  educator_id uuid not null references auth.users (id) on delete cascade,
  bucket_id text not null default 'observation-media',
  object_path text not null,
  bytes bigint not null check (bytes >= 0),
  event_type text not null check (event_type in ('upload', 'delete')),
  created_at timestamptz not null default now()
);

create index if not exists educator_storage_events_educator_id_idx
  on educator_storage_events (educator_id, created_at desc);

alter table educator_storage_events enable row level security;

drop policy if exists "educators_select_own_storage_events" on educator_storage_events;
drop policy if exists "educators_insert_own_storage_events" on educator_storage_events;

create policy "educators_select_own_storage_events"
  on educator_storage_events for select
  using (auth.uid() = educator_id);

create policy "educators_insert_own_storage_events"
  on educator_storage_events for insert
  with check (auth.uid() = educator_id);

create or replace view educator_storage_totals as
select
  educator_id,
  coalesce(
    sum(case when event_type = 'upload' then bytes else -bytes end),
    0
  )::bigint as net_bytes,
  count(*) filter (where event_type = 'upload') as uploads,
  count(*) filter (where event_type = 'delete') as deletes
from educator_storage_events
group by educator_id;
