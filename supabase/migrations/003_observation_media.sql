-- Observation photo / voice memo paths + private storage bucket
-- Run in Supabase SQL Editor (safe to run more than once)

alter table observations
  add column if not exists image_url text,
  add column if not exists audio_url text;

insert into storage.buckets (id, name, public)
values ('observation-media', 'observation-media', false)
on conflict (id) do update set public = false;

drop policy if exists "authenticated_upload_observation_media" on storage.objects;
drop policy if exists "authenticated_select_observation_media" on storage.objects;
drop policy if exists "authenticated_delete_observation_media" on storage.objects;

create policy "authenticated_upload_observation_media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'observation-media');

create policy "authenticated_select_observation_media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'observation-media');

create policy "authenticated_delete_observation_media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'observation-media');
