"use client";

import { Plus } from "lucide-react";

import { createGroupObservation } from "@/app/actions/observations";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { Child } from "@/lib/types";
import { fieldClass, sectionLabelClass } from "@/lib/ui-classes";

type Props = {
  students: Child[];
  selectedIds: string[];
};

export function GroupObservationForm({ students, selectedIds }: Props) {
  const selectedNames = students
    .filter((s) => selectedIds.includes(s.id))
    .map((s) => s.name);

  return (
    <section className="spark-panel-highlight">
      <h2 className={`${sectionLabelClass} mb-3`}>Group observation</h2>
      <p className="mb-4 text-[12px] leading-[1.6] text-[#8a9490]">
        Check students in the list below, write one observation — each gets their
        own saved entry and reflection.
      </p>
      <form action={createGroupObservation} className="flex flex-col gap-4">
        {selectedIds.map((id) => (
          <input key={id} type="hidden" name="child_ids" value={id} />
        ))}

        {selectedNames.length > 0 && (
          <p className="text-[11px] font-medium text-[#9a7c2e]">
            {selectedNames.map((name) => `✓ ${name}`).join(" · ")}
          </p>
        )}

        <textarea
          name="observation_text"
          required
          rows={6}
          maxLength={20000}
          placeholder="Write what you saw and heard — include context, what each child said or did, and any interactions between them."
          className={`${fieldClass} resize-y`}
        />
        <p className="text-[12px] text-[#8a9490]">
          Richer observations lead to richer reflections.
        </p>

        <FormSubmitButton
          variant="cta"
          size="lg"
          pendingLabel="Saving…"
          className="w-full sm:w-auto"
          disabled={selectedIds.length < 2}
        >
          <Plus />
          Save group observation
        </FormSubmitButton>
      </form>
    </section>
  );
}
