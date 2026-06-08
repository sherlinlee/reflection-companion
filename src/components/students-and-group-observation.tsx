"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createGroupObservation } from "@/app/actions/observations";
import { FormSubmitButton } from "@/components/form-submit-button";
import { StudentList } from "@/components/student-list";
import type { Child } from "@/lib/types";
import { fieldClass, sectionLabelClass } from "@/lib/ui-classes";

type Props = {
  students: Child[];
  countMap: Record<string, number>;
  lastObsMap: Record<string, string>;
};

export function StudentsAndGroupObservation({
  students,
  countMap,
  lastObsMap,
}: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const showGroupObservation = students.length >= 2;

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedNames = students
    .filter((s) => selectedIds.has(s.id))
    .map((s) => s.name);

  if (!showGroupObservation) {
    return (
      <StudentList
        students={students}
        countMap={countMap}
        lastObsMap={lastObsMap}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      {/* Mobile: student list first */}
      <div className="order-1 lg:order-2">
        <StudentList
          students={students}
          countMap={countMap}
          lastObsMap={lastObsMap}
          groupSelect={{
            selectedIds,
            onToggle: toggleStudent,
          }}
        />
      </div>

      {/* Mobile: group form below list; desktop: left column */}
      <section className="spark-panel-highlight order-2 lg:order-1">
        <h2 className={`${sectionLabelClass} mb-3`}>Group observation</h2>
        <p className="mb-4 text-[12px] leading-[1.6] text-[#8a9490]">
          Check students in the list, write one observation — each gets their own
          saved entry and reflection.
        </p>
        <form action={createGroupObservation} className="flex flex-col gap-4">
          {[...selectedIds].map((id) => (
            <input key={id} type="hidden" name="child_ids" value={id} />
          ))}

          <textarea
            name="observation_text"
            required
            rows={6}
            maxLength={20000}
            placeholder="Write what you saw and heard — include context, what each child said or did, and any interactions between them."
            className={`${fieldClass} resize-y`}
          />

          {selectedNames.length > 0 && (
            <p className="text-[11px] font-medium text-[#9a7c2e]">
              {selectedNames.join(" · ")}
            </p>
          )}

          <p className="text-[12px] text-[#8a9490]">
            Richer observations lead to richer reflections.
          </p>

          <FormSubmitButton
            variant="cta"
            size="lg"
            pendingLabel="Saving…"
            className="w-full sm:w-auto"
            disabled={selectedIds.size < 2}
          >
            <Plus />
            Save group observation
          </FormSubmitButton>
        </form>
      </section>
    </div>
  );
}
