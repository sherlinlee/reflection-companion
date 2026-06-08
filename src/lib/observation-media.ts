/** Observation media: Supabase Storage paths in Postgres, not file bytes. */

export const OBSERVATION_MEDIA_BUCKET = "observation-media";

/** v1: at most one photo and one voice memo per observation. */
export const MAX_PHOTOS_PER_OBSERVATION = 1;
export const MAX_AUDIO_PER_OBSERVATION = 1;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 50 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mp4",
  "audio/mpeg",
  "audio/webm",
  "audio/x-m4a",
  "audio/m4a",
]);

export const MEDIA_UPLOAD_ERROR_MESSAGES: Record<string, string> = {
  image_too_large: "Photo must be 10 MB or smaller.",
  audio_too_large: "Voice memo must be 50 MB or smaller.",
  image_type: "Photo must be JPEG, PNG, WEBP, or HEIC.",
  audio_type: "Voice memo must be M4A, MP3, MP4, or WEBM.",
  image_upload: "Could not save the photo. Try again or continue without it.",
  audio_upload: "Could not save the voice memo. Try again or continue without it.",
  too_many_images: "Only one photo per observation (v1).",
  too_many_audio: "Only one voice memo per observation (v1).",
  save_failed: "Could not save the observation. Try again.",
  invalid_media: "Invalid media attachment. Try uploading again.",
};

export function validateImageFile(file: File): string | null {
  if (file.size > MAX_IMAGE_BYTES) return "image_too_large";
  const type = file.type || "application/octet-stream";
  if (!ALLOWED_IMAGE_TYPES.has(type)) return "image_type";
  return null;
}

export function validateAudioFile(file: File): string | null {
  if (file.size > MAX_AUDIO_BYTES) return "audio_too_large";
  const type = file.type || "application/octet-stream";
  if (!ALLOWED_AUDIO_TYPES.has(type)) return "audio_type";
  return null;
}

export function buildStoragePath(
  educatorId: string,
  folder: "images" | "audio",
  ext: string,
): string {
  return `${educatorId}/${folder}/${crypto.randomUUID()}.${ext}`;
}
