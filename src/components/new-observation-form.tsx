"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { createObservation } from "@/app/actions/observations";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  cleanupClientUploadedPaths,
  uploadObservationMediaFromBrowser,
} from "@/lib/observation-media-client";
import { MEDIA_UPLOAD_ERROR_MESSAGES } from "@/lib/observation-media";
import type { Child } from "@/lib/types";
import { cardClass, fieldClass, sectionLabelClass } from "@/lib/ui-classes";

type OtherChild = Pick<Child, "id" | "name" | "class_name">;

type Props = {
  childId: string;
  others: OtherChild[];
};

type SubmitPhase = "idle" | "uploading" | "saving";

export function NewObservationForm({ childId, others }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [phase, setPhase] = useState<SubmitPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = phase !== "idle";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const observation_text = String(formData.get("observation_text") ?? "").trim();

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

    const saveData = new FormData();
    saveData.set("child_id", childId);
    saveData.set("observation_text", observation_text);
    if (image_url) saveData.set("image_url", image_url);
    if (audio_url) saveData.set("audio_url", audio_url);

    const additionalChildIds = formData.getAll("additional_child_ids").map(String);
    for (const id of additionalChildIds) {
      saveData.append("additional_child_ids", id);
    }

    const result = await createObservation(saveData);

    if (result?.error) {
      await cleanupClientUploadedPaths(uploadedPaths);
      setErrorMessage(
        MEDIA_UPLOAD_ERROR_MESSAGES[result.error] ??
          "Could not save the observation. Try again.",
      );
      setPhase("idle");
    }
  }

  const submitLabel =
    phase === "uploading"
      ? "Uploading…"
      : phase === "saving"
        ? "Saving…"
        : "Save observation";

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

      <textarea
        id="observation_text"
        name="observation_text"
        required
        rows={12}
        maxLength={20000}
        disabled={isBusy}
        placeholder={`Write what you saw and heard — in the child's own words where possible.\n\nExample:\n\nAva crouched by the garden bed and picked up a worm. She held it carefully and said: "The worm is building a road underground. He's an engineer like my dad."\n\nShe spent 10 minutes watching it move before asking if worms sleep.`}
        className={`${fieldClass} min-h-[260px] resize-y`}
      />

      <p className="text-[12px] text-[#8a9490]">
        Richer observations lead to richer reflections.
      </p>

      <div className="border-t border-[rgba(154,124,46,0.1)] pt-4">
        <p className={`${sectionLabelClass} mb-1`}>Attach media</p>
        <p className="mb-3 text-[12px] leading-[1.5] text-[#8a9490]">
          Optional — one photo and one voice memo per observation. Files upload
          directly to Supabase Storage from your browser; only paths are saved
          on the observation.
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
