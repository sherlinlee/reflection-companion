"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { Loader2, Mic, MicOff } from "lucide-react";

import { createObservation } from "@/app/actions/observations";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  cleanupClientUploadedPaths,
  uploadObservationMediaFromBrowser,
} from "@/lib/observation-media-client";
import {
  audioFileExtension,
  MEDIA_UPLOAD_ERROR_MESSAGES,
  normalizeAudioMimeType,
  validateAudioFile,
} from "@/lib/observation-media";
import { appendTranscript, transcribeAudioFile } from "@/lib/transcribe-audio";
import type { Child } from "@/lib/types";
import { cardClass, fieldClass, sectionLabelClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type OtherChild = Pick<Child, "id" | "name" | "class_name">;

type Props = {
  childId: string;
  others: OtherChild[];
};

type SubmitPhase = "idle" | "uploading" | "saving";

const STARTER_CHIPS = [
  'Child said: "',
  "Child was doing…",
  "I noticed…",
  "Child asked…",
  "Together they…",
] as const;

const NEL_CHIPS = [
  "Reflectiveness — I noticed…",
  "Sense of wonder — Child wondered…",
  "Inventiveness — Child tried…",
  "Curiosity — Child explored…",
  "Healthy sense of self — Child expressed…",
] as const;

const starterChipClass =
  "shrink-0 rounded-full border border-[rgba(154,124,46,0.2)] bg-white px-3 py-1 text-[12px] text-[#9a7c2e] transition-colors hover:bg-[#faf4e6]";

const nelChipClass =
  "shrink-0 rounded-full border border-[rgba(83,74,183,0.2)] bg-[#f0eef8] px-3 py-1 text-[12px] text-[#534AB7] transition-colors hover:bg-[#e6e3f5]";

export function ObservationForm({ childId, others }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [observationText, setObservationText] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  const [transcribeNote, setTranscribeNote] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  const isBusy = phase !== "idle" || transcribing || recording;

  function insertAtStart(text: string) {
    setObservationText((prev) => text + (prev ? prev : ""));
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function handleAudioChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setTranscribeNote(null);

    if (!file || file.size === 0) return;

    const validationError = validateAudioFile(file);
    if (validationError) {
      setErrorMessage(MEDIA_UPLOAD_ERROR_MESSAGES[validationError] ?? validationError);
      e.target.value = "";
      return;
    }

    setErrorMessage(null);
    setTranscribing(true);

    const result = await transcribeAudioFile(file);

    setTranscribing(false);

    if ("error" in result) {
      setTranscribeNote(result.error);
      return;
    }

    setObservationText((current) => appendTranscript(current, result.text));
    setTranscribeNote("Voice memo transcribed into the observation box below.");
  }

  async function stopRecordingAndTranscribe() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setRecording(false);
      setTranscribeNote("No audio was captured. Try recording again.");
      return;
    }

    setRecording(false);

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const mime = normalizeAudioMimeType(recorder.mimeType || "audio/webm");
        resolve(new Blob(chunksRef.current, { type: mime }));
      };
      if (recorder.state === "recording") {
        recorder.requestData();
      }
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
    });

    mediaRecorderRef.current = null;
    chunksRef.current = [];

    if (blob.size === 0) {
      setTranscribeNote(
        "Recording was empty. Hold Record, speak for a few seconds, then tap Stop.",
      );
      return;
    }

    setTranscribing(true);
    setTranscribeNote(null);

    const mimeType = normalizeAudioMimeType(blob.type || "audio/webm");
    const file = new File(
      [blob],
      `recording.${audioFileExtension(mimeType)}`,
      { type: mimeType },
    );
    const result = await transcribeAudioFile(file);

    setTranscribing(false);

    if ("error" in result) {
      setTranscribeNote(result.error);
      return;
    }

    setObservationText((current) => appendTranscript(current, result.text));
    setTranscribeNote("Live recording transcribed into the observation box.");
  }

  async function toggleLiveRecording() {
    if (recording) {
      await stopRecordingAndTranscribe();
      return;
    }

    setTranscribeNote(null);
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      textareaRef.current?.focus();
    } catch {
      setErrorMessage(
        "Microphone access was denied. Allow microphone access or type your observation.",
      );
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const observation_text = observationText.trim();

    if (!observation_text) {
      setErrorMessage("Observation text is required.");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const imageInput = form.querySelector<HTMLInputElement>('input[name="image"]');
    const audioInput = form.querySelector<HTMLInputElement>('input[name="audio"]');
    const imageFile = imageInput?.files?.[0] ?? null;
    const audioFile = audioInput?.files?.[0] ?? null;

    const uploadedPaths: string[] = [];
    let image_url: string | null = null;
    let audio_url: string | null = null;

    const needsUpload =
      (imageFile && imageFile.size > 0) || (audioFile && audioFile.size > 0);

    if (needsUpload) setPhase("uploading");

    if (imageFile && imageFile.size > 0) {
      const result = await uploadObservationMediaFromBrowser(
        user.id,
        "images",
        imageFile,
      );
      if ("error" in result) {
        setErrorMessage(MEDIA_UPLOAD_ERROR_MESSAGES[result.error] ?? result.error);
        setPhase("idle");
        return;
      }
      uploadedPaths.push(result.path);
      image_url = result.path;
    }

    if (audioFile && audioFile.size > 0) {
      const result = await uploadObservationMediaFromBrowser(
        user.id,
        "audio",
        audioFile,
      );
      if ("error" in result) {
        await cleanupClientUploadedPaths(uploadedPaths);
        setErrorMessage(MEDIA_UPLOAD_ERROR_MESSAGES[result.error] ?? result.error);
        setPhase("idle");
        return;
      }
      uploadedPaths.push(result.path);
      audio_url = result.path;
    }

    setPhase("saving");

    const additionalChildIds = formData
      .getAll("additional_child_ids")
      .map(String)
      .filter(Boolean);

    try {
      const result = await createObservation({
        child_id: childId,
        observation_text,
        image_url: image_url ?? undefined,
        audio_url: audio_url ?? undefined,
        additional_child_ids: additionalChildIds,
      });

      if (result?.error) {
        await cleanupClientUploadedPaths(uploadedPaths);

        if (result.error === "not_authenticated") {
          window.location.href = "/login";
          return;
        }

        const baseMessage =
          MEDIA_UPLOAD_ERROR_MESSAGES[result.error] ??
          "Could not save the observation. Try again.";
        setErrorMessage(
          result.reason ? `${baseMessage} (${result.reason})` : baseMessage,
        );
        console.error("createObservation failed:", result);
        setPhase("idle");
      }
    } catch (err) {
      unstable_rethrow(err);
    }
  }

  const submitLabel =
    phase === "uploading"
      ? "Uploading…"
      : phase === "saving"
        ? "Saving…"
        : "Save observation";

  const textareaPlaceholder = recording
    ? "Recording…"
    : transcribing
      ? "Transcribing…"
      : `Write what you saw and heard — in the child's own words where possible.\n\nExample:\n\nAva crouched by the garden bed and picked up a worm. She held it carefully and said: "The worm is building a road underground. He's an engineer like my dad."\n\nShe spent 10 minutes watching it move before asking if worms sleep.`;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`${cardClass} flex flex-col gap-5`}
    >
      <input type="hidden" name="child_id" value={childId} />

      <div>
        <label
          htmlFor="observation_text"
          className="font-heading text-lg font-semibold"
        >
          Observation
        </label>
        <p className="mt-1 text-[12px] leading-[1.6] text-[#8a9490]">
          The quality of your observation shapes the depth of reflection.
          Include what you saw, what they said, and the context — the richer
          the detail, the more meaningful the reflection.
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {STARTER_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            disabled={isBusy}
            onClick={() => insertAtStart(chip)}
            className={starterChipClass}
          >
            {chip}
          </button>
        ))}
      </div>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8a9490]">
          NEL dispositions
        </p>
        <p className="mt-0.5 text-[10px] text-[#8a9490]">
          Singapore NEL 2022 framework
        </p>
        <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {NEL_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={isBusy}
              onClick={() => insertAtStart(chip)}
              className={nelChipClass}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          id="observation_text"
          name="observation_text"
          required
          rows={12}
          maxLength={20000}
          disabled={isBusy}
          value={observationText}
          onChange={(e) => setObservationText(e.target.value)}
          placeholder={textareaPlaceholder}
          className={`${fieldClass} min-h-[260px] resize-y pr-24`}
        />
        <button
          type="button"
          disabled={phase !== "idle" || transcribing}
          onClick={() => void toggleLiveRecording()}
          aria-label={recording ? "Stop recording" : "Start voice recording"}
          className={cn(
            "absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full border border-[rgba(154,124,46,0.2)] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#9a7c2e] transition-colors",
            recording &&
              "animate-pulse border-[#e24b4a] bg-[#fcebeb] text-[#a32d2d]",
          )}
        >
          {recording ? (
            <>
              <MicOff className="size-3.5" />
              Stop
            </>
          ) : (
            <>
              <Mic className="size-3.5" />
              Record
            </>
          )}
        </button>
      </div>

      {transcribing && (
        <p className="flex items-center gap-2 text-[12px] text-[#9a7c2e]">
          <Loader2 className="size-3.5 animate-spin" />
          Transcribing…
        </p>
      )}
      {transcribeNote && (
        <p
          role={transcribeNote.includes("transcribed") ? undefined : "alert"}
          className={cn(
            "text-[12px]",
            transcribeNote.includes("transcribed")
              ? "text-[#8a9490]"
              : "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-800",
          )}
        >
          {transcribeNote}
        </p>
      )}

      <p className="text-[12px] text-[#8a9490]">
        Richer observations lead to richer reflections.
      </p>

      <div className="border-t border-[rgba(154,124,46,0.1)] pt-4">
        <p className={`${sectionLabelClass} mb-1`}>Attach media</p>
        <p className="mb-3 text-[12px] leading-[1.5] text-[#8a9490]">
          Optional — one photo and one voice memo per observation. Voice memos
          are transcribed into the observation box automatically (up to 25 MB).
          Files upload directly to Supabase Storage; only paths are saved on the
          observation.
        </p>
        {errorMessage && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800"
          >
            {errorMessage}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#3d4f4c]">
              Photo (1)
            </span>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              disabled={isBusy}
              className="block w-full rounded-lg border border-[rgba(154,124,46,0.2)] bg-white px-3 py-2 text-[12px] text-[#8a9490] file:mr-3 file:rounded-md file:border-0 file:bg-[#faf4e6] file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-[#9a7c2e] hover:border-[rgba(154,124,46,0.35)] disabled:opacity-60"
            />
            <span className="text-[11px] text-[#8a9490]">
              JPEG, PNG, WEBP, HEIC · max 10 MB
            </span>
          </label>

          <label className="flex cursor-pointer flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#3d4f4c]">
              Voice memo (1)
            </span>
            <input
              type="file"
              name="audio"
              accept="audio/mp4,audio/mpeg,audio/webm,audio/x-m4a,audio/m4a"
              disabled={isBusy}
              onChange={handleAudioChange}
              className="block w-full rounded-lg border border-[rgba(154,124,46,0.2)] bg-white px-3 py-2 text-[12px] text-[#8a9490] file:mr-3 file:rounded-md file:border-0 file:bg-[#faf4e6] file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-[#9a7c2e] hover:border-[rgba(154,124,46,0.35)] disabled:opacity-60"
            />
            <span className="text-[11px] text-[#8a9490]">
              M4A, MP3, MP4, WEBM · max 50 MB
            </span>
          </label>
        </div>
      </div>

      {others.length > 0 && (
        <div className="border-t border-[rgba(154,124,46,0.1)] pt-4">
          <p className={`${sectionLabelClass} mb-3`}>Also document for</p>
          <p className="mb-3 text-[12px] leading-[1.5] text-[#8a9490]">
            This observation will be saved separately for each selected
            student — each gets their own reflection.
          </p>
          <div className="flex flex-wrap gap-2">
            {others.map((other) => (
              <label
                key={other.id}
                className="group flex cursor-pointer items-center gap-2 rounded-full border border-[rgba(154,124,46,0.2)] bg-white px-3 py-1.5 text-[13px] text-[#3d4f4c] transition-colors has-[:checked]:border-[#9a7c2e] has-[:checked]:bg-[#faf4e6] has-[:checked]:text-[#9a7c2e]"
              >
                <input
                  type="checkbox"
                  name="additional_child_ids"
                  value={other.id}
                  disabled={isBusy}
                  className="sr-only"
                />
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[rgba(154,124,46,0.3)] text-[10px] group-has-[:checked]:border-[#9a7c2e] group-has-[:checked]:bg-[#9a7c2e] group-has-[:checked]:text-white">
                  ✓
                </span>
                <span>{other.name}</span>
                {other.class_name && (
                  <span className="text-[11px] text-[#8a9490]">
                    {other.class_name}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-1">
        <Button type="submit" variant="cta" size="lg" disabled={isBusy}>
          {isBusy && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          disabled={isBusy}
          render={<Link href={`/children/${childId}`} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
