"use client";

import { useMemo, useState } from "react";

import { MomentumStrip } from "@/components/momentum-strip";
import { StudentsAndGroupObservation } from "@/components/students-and-group-observation";
import type { Child } from "@/lib/types";
import { cn } from "@/lib/utils";

type WeekObs = { created_at: string; child_id: string };

type Props = {
  students: Child[];
  countMap: Record<string, number>;
  lastObsMap: Record<string, string>;
  weekObs: WeekObs[];
};

function shouldShowClassFilter(students: Child[]): boolean {
  const classes = students
    .map((s) => s.class_name?.trim())
    .filter((c): c is string => Boolean(c));

  if (classes.length === 0) return false;

  const unique = new Set(classes);
  return unique.size > 1;
}

const pillBase =
  "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors";

export function StudentsPageContent({
  students,
  countMap,
  lastObsMap,
  weekObs,
}: Props) {
  const classes = useMemo(() => {
    const names = students
      .map((s) => s.class_name?.trim())
      .filter((c): c is string => Boolean(c));
    return [...new Set(names)].sort();
  }, [students]);

  const showFilter = shouldShowClassFilter(students);
  const [classFilter, setClassFilter] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    if (!classFilter) return students;
    return students.filter((s) => s.class_name?.trim() === classFilter);
  }, [students, classFilter]);

  const filteredStudentIds = useMemo(
    () => new Set(filteredStudents.map((s) => s.id)),
    [filteredStudents],
  );

  const filteredWeekObs = useMemo(
    () => weekObs.filter((o) => filteredStudentIds.has(o.child_id)),
    [weekObs, filteredStudentIds],
  );

  return (
    <>
      {students.length > 0 && (
        <MomentumStrip observations={filteredWeekObs} />
      )}

      {showFilter && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setClassFilter(null)}
            className={cn(
              pillBase,
              classFilter === null
                ? "border-[#9a7c2e] bg-[#faf4e6] text-[#9a7c2e]"
                : "border-[rgba(154,124,46,0.2)] bg-white text-[#8a9490]",
            )}
          >
            All
          </button>
          {classes.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setClassFilter(name)}
              className={cn(
                pillBase,
                classFilter === name
                  ? "border-[#9a7c2e] bg-[#faf4e6] text-[#9a7c2e]"
                  : "border-[rgba(154,124,46,0.2)] bg-white text-[#8a9490]",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <StudentsAndGroupObservation
        students={filteredStudents}
        countMap={countMap}
        lastObsMap={lastObsMap}
      />
    </>
  );
}
