"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Users } from "lucide-react";

import type { Child } from "@/lib/types";
import {
  avatarClass,
  cardClass,
  linkArrowClass,
  linkRowClass,
  listPanelClass,
  sectionLabelClass,
} from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

const MAX_DOTS = 8;
const STALE_DAYS = 14;

type GroupSelectProps = {
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
};

type Props = {
  students: Child[];
  countMap: Record<string, number>;
  lastObsMap: Record<string, string>;
  groupSelect?: GroupSelectProps;
};

function daysSince(dateStr: string): number {
  const last = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - last.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getEquityState(
  count: number,
  lastObs: string | undefined,
): { type: "dots"; filled: number } | { type: "nudge"; message: string } {
  if (count === 0) {
    return { type: "nudge", message: "Not yet documented" };
  }

  if (lastObs && daysSince(lastObs) > STALE_DAYS) {
    return { type: "nudge", message: "No entry in 14 days" };
  }

  const filled = Math.min(count, MAX_DOTS);
  return { type: "dots", filled };
}

export function StudentList({
  students,
  countMap,
  lastObsMap,
  groupSelect,
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <section>
      <h2 className={`${sectionLabelClass} mb-4 flex items-center gap-2`}>
        <Users className="size-4" />
        Your students
      </h2>
      {students.length === 0 ? (
        <div className={`${cardClass} text-center text-sm text-muted-foreground`}>
          No students yet. Add one above to begin documenting.
        </div>
      ) : (
        <ul className={listPanelClass}>
          {students.map((child) => {
            const isLoading = loadingId === child.id;
            const count = countMap[child.id] ?? 0;
            const lastObs = lastObsMap[child.id];
            const equity = getEquityState(count, lastObs);
            const hasNudge = equity.type === "nudge";
            const isGroupSelected = groupSelect?.selectedIds.has(child.id) ?? false;

            return (
              <li
                key={child.id}
                className="border-b border-[rgba(154,124,46,0.08)] last:border-0"
              >
                <div
                  className={cn(
                    linkRowClass,
                    "transition-opacity duration-150",
                    hasNudge && "bg-[rgba(252,235,235,0.35)]",
                    isGroupSelected && "bg-[#faf4e6]/60",
                  )}
                >
                  {groupSelect && (
                    <label
                      className="flex shrink-0 cursor-pointer items-center py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isGroupSelected}
                        onChange={() => groupSelect.onToggle(child.id)}
                        aria-label={`Include ${child.name} in group observation`}
                        className="size-4 rounded border-[rgba(154,124,46,0.35)] text-[#9a7c2e] focus:ring-[#9a7c2e]/30"
                      />
                    </label>
                  )}
                  <Link
                    href={`/children/${child.id}`}
                    onClick={() => setLoadingId(child.id)}
                    aria-busy={isLoading}
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-[0.875rem]",
                      isLoading && "pointer-events-none opacity-60",
                    )}
                  >
                  <span className={avatarClass}>
                    {child.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-[#0F1A18]">
                      {child.name}
                    </span>
                    <span className="block text-xs text-[#7A9490]">
                      {child.class_name
                        ? `${child.class_name}${child.age != null ? ` · Age ${child.age}` : ""}`
                        : child.age != null
                          ? `Age ${child.age}`
                          : "View observations"}
                    </span>
                  </span>

                  <span className="flex shrink-0 flex-col items-end gap-0.5">
                    {equity.type === "nudge" ? (
                      <span className="rounded bg-[#fcebeb] px-1.5 py-0.5 text-[10px] font-medium text-[#a32d2d]">
                        {equity.message}
                      </span>
                    ) : (
                      <>
                        <span className="flex gap-[3px]">
                          {Array.from({ length: MAX_DOTS }, (_, i) => (
                            <span
                              key={i}
                              className={cn(
                                "size-1.5 rounded-full",
                                i < equity.filled
                                  ? "bg-[#9a7c2e]"
                                  : "bg-[rgba(154,124,46,0.15)]",
                              )}
                            />
                          ))}
                        </span>
                        <span className="text-[10px] text-[#8a9490]">
                          {count} {count === 1 ? "observation" : "observations"}
                        </span>
                      </>
                    )}
                  </span>

                  <span
                    className={cn(
                      linkArrowClass,
                      "inline-flex min-w-[1rem] items-center justify-center",
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="size-3.5 animate-spin text-[#c8a85a]" />
                    ) : (
                      "→"
                    )}
                  </span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
