import {
  audioFileExtension,
  normalizeAudioMimeType,
  WHISPER_MAX_BYTES,
} from "@/lib/observation-media";

export async function transcribeAudioFile(
  file: File,
): Promise<{ text: string } | { error: string }> {
  if (file.size > WHISPER_MAX_BYTES) {
    return {
      error:
        "Voice memo is too large to transcribe (max 25 MB). You can still save it as an attachment.",
    };
  }

  const mimeType = normalizeAudioMimeType(file.type || "audio/webm");
  const ext = audioFileExtension(mimeType);
  const payload =
    file.type === mimeType
      ? file
      : new File([file], file.name || `recording.${ext}`, { type: mimeType });

  const formData = new FormData();
  formData.append("audio", payload);

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { text?: string; error?: string };

  if (!response.ok || !data.text) {
    return { error: data.error ?? "Transcription failed. Try again." };
  }

  return { text: data.text };
}

export function appendTranscript(
  current: string,
  transcript: string,
): string {
  const trimmed = current.trim();
  if (!trimmed) return transcript;
  return `${trimmed}\n\n${transcript}`;
}
