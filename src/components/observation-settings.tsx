"use client";

import { useState } from "react";

import {
  deleteObservation,
  updateObservation,
} from "@/app/actions/observations";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass } from "@/lib/ui-classes";

type Props = {
  observationId: string;
  childId: string;
  childName: string;
  observationText: string;
  createdAt: string;
};

export function ObservationSettings({
  observationId,
  childId,
  childName,
  observationText,
  createdAt,
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
            Saving clears the current reflection—you can generate a new one
            after editing.
          </p>
          <Button type="submit" variant="cta" className="w-full sm:w-auto">
            Save observation
          </Button>
        </form>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {observationText}
          </p>
          <time
            dateTime={createdAt}
            className="mt-4 block text-xs text-muted-foreground"
          >
            {new Date(createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </time>
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
        <Button type="submit" variant="destructive" size="sm">
          Delete observation
        </Button>
      </form>
    </section>
  );
}
