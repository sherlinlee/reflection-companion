"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  deleteObservation,
  updateObservation,
} from "@/app/actions/observations";
import { ActionLink } from "@/components/action-link";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, pillButtonClass } from "@/lib/ui-classes";

type Props = {
  observationId: string;
  childId: string;
  childName: string;
  observationText: string;
  createdAt: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
};

export function ObservationSettings({
  observationId,
  childId,
  childName,
  observationText,
  createdAt,
  imageUrl,
  audioUrl,
}: Props) {
  const [editing, setEditing] = useState(false);

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    const message =
      "Delete this observation and its reflection? This cannot be undone.";
    if (!confirm(message)) {
      e.preventDefault();
    }
  }

  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">
          Observation
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {editing ? (
        <form action={updateObservation} className="flex flex-col gap-3">
          <input type="hidden" name="observation_id" value={observationId} />
          <input type="hidden" name="child_id" value={childId} />
          <textarea
            name="observation_text"
            required
            rows={12}
            maxLength={20000}
            defaultValue={observationText}
            className={`${fieldClass} min-h-[200px] resize-y`}
          />
          <p className="text-xs text-muted-foreground">
            Saving clears the current reflection — you can generate a new one
            after editing.
          </p>
          <FormSubmitButton
            variant="cta"
            pendingLabel="Saving…"
            className="w-full sm:w-auto"
          >
            Save observation
          </FormSubmitButton>
        </form>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#3d4f4c]">
            {observationText}
          </p>

          {/* ── Photo ── */}
          {imageUrl && (
            <div className="mt-4">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#c8a85a]">
                Photo
              </p>
              <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={imageUrl}
                  alt="Observation photo"
                  className="max-h-[400px] w-full rounded-lg border border-[rgba(154,124,46,0.12)] object-cover transition-opacity hover:opacity-90"
                />
              </a>
            </div>
          )}

          {/* ── Voice memo ── */}
          {audioUrl && (
            <div className="mt-4">
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#c8a85a]">
                Voice memo
              </p>
              <audio
                controls
                src={audioUrl}
                className="w-full rounded-lg"
              />
            </div>
          )}

          <time
            dateTime={createdAt}
            className="mt-4 block text-xs text-muted-foreground"
          >
            {new Date(createdAt).toLocaleString("en", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>

          <div className="mt-4 border-t border-[rgba(154,124,46,0.1)] pt-4">
            <ActionLink
              href={`/children/${childId}/observations/new`}
              className={pillButtonClass}
            >
              <Plus className="size-3.5" />
              Add another observation
            </ActionLink>
          </div>
        </>
      )}

      <form
        action={deleteObservation}
        onSubmit={handleDelete}
        className="mt-6 border-t border-border pt-6"
      >
        <input type="hidden" name="observation_id" value={observationId} />
        <input type="hidden" name="child_id" value={childId} />
        <p className="mb-3 text-xs text-muted-foreground">
          Removes this observation from {childName}&apos;s documentation.
        </p>
        <FormSubmitButton
          variant="destructive"
          size="sm"
          pendingLabel="Deleting…"
        >
          Delete observation
        </FormSubmitButton>
      </form>
    </section>
  );
}