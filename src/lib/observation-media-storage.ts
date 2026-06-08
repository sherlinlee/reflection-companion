import type { SupabaseClient } from "@supabase/supabase-js";

import {
  OBSERVATION_MEDIA_BUCKET,
  type PreparedMediaUpload,
  buildStoragePath,
} from "@/lib/observation-media";

type StorageClient = SupabaseClient;

export async function uploadObservationMedia(
  supabase: StorageClient,
  educatorId: string,
  folder: "images" | "audio",
  prepared: PreparedMediaUpload,
): Promise<string | null> {
  const path = buildStoragePath(educatorId, folder, prepared.ext);
  const { error } = await supabase.storage
    .from(OBSERVATION_MEDIA_BUCKET)
    .upload(path, prepared.buffer, {
      contentType: prepared.contentType,
      upsert: false,
    });

  if (error) return null;

  await logStorageEvent(supabase, educatorId, path, prepared.bytes, "upload");
  return path;
}

/** Removes paths only when no other observation row still references them. */
export async function removeObservationMediaPaths(
  supabase: StorageClient,
  educatorId: string,
  paths: string[],
  excludeObservationId?: string,
): Promise<void> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return;

  const toRemove: string[] = [];
  for (const path of unique) {
    const stillUsed = await isStoragePathReferenced(
      supabase,
      path,
      excludeObservationId,
    );
    if (!stillUsed) toRemove.push(path);
  }

  if (toRemove.length === 0) return;

  await supabase.storage.from(OBSERVATION_MEDIA_BUCKET).remove(toRemove);

  for (const path of toRemove) {
    const bytes = await getLastUploadBytes(supabase, path);
    await logStorageEvent(supabase, educatorId, path, bytes, "delete");
  }
}

export async function cleanupUploadedPaths(
  supabase: StorageClient,
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;
  await supabase.storage.from(OBSERVATION_MEDIA_BUCKET).remove(paths);
}

async function isStoragePathReferenced(
  supabase: StorageClient,
  path: string,
  excludeObservationId?: string,
): Promise<boolean> {
  let query = supabase
    .from("observations")
    .select("id", { count: "exact", head: true })
    .or(`image_url.eq.${path},audio_url.eq.${path}`);

  if (excludeObservationId) {
    query = query.neq("id", excludeObservationId);
  }

  const { count, error } = await query;
  if (error) return true;
  return (count ?? 0) > 0;
}

async function getLastUploadBytes(
  supabase: StorageClient,
  path: string,
): Promise<number> {
  const { data } = await supabase
    .from("educator_storage_events")
    .select("bytes")
    .eq("object_path", path)
    .eq("event_type", "upload")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Number(data?.bytes ?? 0);
}

export async function logStorageEvent(
  supabase: StorageClient,
  educatorId: string,
  objectPath: string,
  bytes: number,
  eventType: "upload" | "delete",
): Promise<void> {
  await supabase.from("educator_storage_events").insert({
    educator_id: educatorId,
    bucket_id: OBSERVATION_MEDIA_BUCKET,
    object_path: objectPath,
    bytes,
    event_type: eventType,
  });
}
