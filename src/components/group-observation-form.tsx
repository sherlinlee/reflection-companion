"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createGroupObservation } from "@/app/actions/observations";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { Child } from "@/lib/types";
import { avatarClass, fieldClass, sectionLabelClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  students: Child[];
};

export function GroupObservationForm({ students }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="spark-panel-highlight">
      <h2 className={`${sectionLabelClass} mb-3`}>Group observation</h2>
      <p className="mb-4 text-[12px] leading-[1.6] text-[#8a9490]">
        Select two or more students, write one observation — each gets their own
        saved entry and reflection.
      </p>
      <form action={createGroupObservation} className="flex flex-col gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {students.map((child) => {
            const selected = selectedIds.has(child.id);

            return (
              <label
                key={child.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-150",
                  selected
                    ? "border-[#9a7c2e] bg-[#faf4e6] shadow-[0_0_0_1px_rgba(154,124,46,0.25)]"
                    : "border-[rgba(154,124,46,0.2)] bg-white hover:border-[rgba(154,124,46,0.35)] hover:bg-[#faf4e6]/40",
                )}
              >
                <input
                  type="checkbox"
                  name="child_ids"
                  value={child.id}
                  checked={selected}
                  onChange={() => toggleStudent(child.id)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    avatarClass,
                    "relative transition-all duration-150",
                    selected &&
                      "bg-white ring-2 ring-[#9a7c2e] ring-offset-2 text-[#9a7c2e]",
                  )}
                >
                  {child.name.charAt(0).toUpperCase()}
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#9a7c2e] text-[9px] font-bold text-white"
                    >
                      ✓
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[13px] font-medium",
                      selected ? "text-[#9a7c2e]" : "text-[#3d4f4c]",
                    )}
                  >
                    {child.name}
                  </span>
                  {child.class_name && (
                    <span className="block text-[11px] text-[#8a9490]">
                      {child.class_name}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>

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
        >
          <Plus />
          Save group observation
        </FormSubmitButton>
      </form>
    </section>
  );
}
