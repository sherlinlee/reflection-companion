"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createChild, type CreateChildState } from "@/app/actions/children";
import { Button } from "@/components/ui/button";
import { cardClass, fieldClass, sectionLabelClass } from "@/lib/ui-classes";

const initialState: CreateChildState = { error: null };

export function AddIndividualForm() {
  const [state, formAction, isPending] = useActionState(
    createChild,
    initialState,
  );

  return (
    <section className={cardClass}>
      <h2 className={`${sectionLabelClass} mb-4`}>Add individual</h2>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          name="name"
          required
          placeholder="Name"
          className={fieldClass}
          disabled={isPending}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="age"
            type="number"
            min={0}
            max={12}
            placeholder="Age (optional)"
            className={fieldClass}
            disabled={isPending}
          />
          <input
            name="class_name"
            placeholder="Class (optional)"
            className={fieldClass}
            disabled={isPending}
          />
        </div>
        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-800"
          >
            {state.error}
          </p>
        )}
        <Button
          type="submit"
          variant="cta"
          className="w-full sm:w-auto"
          size="lg"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Adding…
            </>
          ) : (
            <>
              <Plus />
              Add individual
            </>
          )}
        </Button>
      </form>
    </section>
  );
}
