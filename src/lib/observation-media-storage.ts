import type { SupabaseClient } from "@supabase/supabase-js";

import { OBSERVATION_MEDIA_BUCKET } from "@/lib/observation-media";

type StorageClient = SupabaseClient;

/** Removes paths only when no other observation row still references them. */
export async function removeObservationMediaPaths(
  supabase: StorageClient,
  educatorId: string,
  paths: string[],
): Promise<void> {
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return;

  const toRemove: string[] = [];
  for (const path of unique) {
    const stillUsed = await isStoragePathReferenced(supabase, path);
    if (!stillUsed) toRemove.push(path);
  }

  if (toRemove.length === 0) return;

  await supabase.storage.from(OBSERVATION_MEDIA_BUCKET).remove(toRemove);

  for (const path of toRemove) {
    const bytes = await getLastUploadBytes(supabase, path);
    await logStorageEvent(supabase, educatorId, path, bytes, "delete");
  }
}

async function isStoragePathReferenced(
  supabase: StorageClient,
  path: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("observations")
    .select("id", { count: "exact", head: true })
    .or(`image_url.eq.${path},audio_url.eq.${path}`);

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

async function logStorageEvent(
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
