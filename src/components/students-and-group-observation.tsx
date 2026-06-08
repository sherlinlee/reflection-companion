"use client";

import { useState } from "react";

import { GroupObservationForm } from "@/components/group-observation-form";
import { StudentList } from "@/components/student-list";
import type { Child } from "@/lib/types";

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const showGroupObservation = students.length >= 2;

  function toggleStudent(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {showGroupObservation && (
        <GroupObservationForm students={students} selectedIds={selectedIds} />
      )}

      <StudentList
        students={students}
        countMap={countMap}
        lastObsMap={lastObsMap}
        groupSelect={
          showGroupObservation
            ? {
                selectedIds: new Set(selectedIds),
                onToggle: toggleStudent,
              }
            : undefined
        }
      />
    </div>
  );
}
