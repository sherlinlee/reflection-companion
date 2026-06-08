"use client";

import { useState } from "react";

import { deleteChild, updateChild } from "@/app/actions/children";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Button } from "@/components/ui/button";
import type { Child } from "@/lib/types";
import { cardClass, fieldClass } from "@/lib/ui-classes";

export function ChildSettings({ child }: { child: Child }) {
  const [editing, setEditing] = useState(false);

  function handleDelete(e: React.FormEvent<HTMLFormElement>) {
    const message = `Delete ${child.name} and all their observations? This cannot be undone.`;
    if (!confirm(message)) {
      e.preventDefault();
    }
  }

  return (
    <section className={cardClass}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Individual profile</h2>
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
        <form action={updateChild} className="flex flex-col gap-3">
          <input type="hidden" name="child_id" value={child.id} />
          <label className="text-sm font-medium" htmlFor="edit-name">
            Name
          </label>
          <input
            id="edit-name"
            name="name"
            required
            defaultValue={child.name}
            className={fieldClass}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium" htmlFor="edit-age">
                Age
              </label>
              <input
                id="edit-age"
                name="age"
                type="number"
                min={0}
                max={12}
                defaultValue={child.age ?? ""}
                placeholder="Optional"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="edit-class">
                Class
              </label>
              <input
                id="edit-class"
                name="class_name"
                defaultValue={child.class_name ?? ""}
                placeholder="Optional"
                className={fieldClass}
              />
            </div>
          </div>
          <FormSubmitButton
            variant="cta"
            pendingLabel="Saving…"
            className="w-full sm:w-auto"
          >
            Save changes
          </FormSubmitButton>
        </form>
      ) : (
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">{child.name}</dd>
          </div>
          {child.age != null && (
            <div>
              <dt className="text-muted-foreground">Age</dt>
              <dd>{child.age}</dd>
            </div>
          )}
          {child.class_name && (
            <div>
              <dt className="text-muted-foreground">Class</dt>
              <dd>{child.class_name}</dd>
            </div>
          )}
        </dl>
      )}

      <form
        action={deleteChild}
        onSubmit={handleDelete}
        className="mt-6 border-t border-border pt-6"
      >
        <input type="hidden" name="child_id" value={child.id} />
        <p className="mb-3 text-xs text-muted-foreground">
          Deleting removes this individual and all observations and reflections
          linked to them.
        </p>
        <FormSubmitButton
          variant="destructive"
          size="sm"
          pendingLabel="Deleting…"
        >
          Delete individual
        </FormSubmitButton>
      </form>
    </section>
  );
}