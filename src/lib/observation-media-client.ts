import { createClient } from "@/lib/supabase/client";
import {
  OBSERVATION_MEDIA_BUCKET,
  buildStoragePath,
  validateAudioFile,
  validateImageFile,
} from "@/lib/observation-media";

export async function uploadObservationMediaFromBrowser(
  educatorId: string,
  folder: "images" | "audio",
  file: File,
): Promise<{ path: string } | { error: string }> {
  const validationError =
    folder === "images" ? validateImageFile(file) : validateAudioFile(file);
  if (validationError) return { error: validationError };

  const ext =
    file.name.split(".").pop()?.toLowerCase() ||
    (folder === "images" ? "jpg" : "m4a");
  const path = buildStoragePath(educatorId, folder, ext);
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(OBSERVATION_MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    return { error: folder === "images" ? "image_upload" : "audio_upload" };
  }

  await supabase.from("educator_storage_events").insert({
    educator_id: educatorId,
    bucket_id: OBSERVATION_MEDIA_BUCKET,
    object_path: path,
    bytes: file.size,
    event_type: "upload",
  });

  return { path };
}

export async function cleanupClientUploadedPaths(
  paths: string[],
): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from(OBSERVATION_MEDIA_BUCKET).remove(paths);
}
