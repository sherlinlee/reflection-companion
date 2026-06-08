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
        <>
          {groupSelect && (
            <p className="mb-2 text-[11px] text-[#8a9490]">
              Tap a student to open their profile. Check to include in group
              observation.
            </p>
          )}
          <ul className={listPanelClass}>
            {students.map((child) => {
              const isLoading = loadingId === child.id;
              const count = countMap[child.id] ?? 0;
              const lastObs = lastObsMap[child.id];
              const equity = getEquityState(count, lastObs);
              const hasNudge = equity.type === "nudge";
              const isGroupSelected =
                groupSelect?.selectedIds.has(child.id) ?? false;

              const rowTint = cn(
                hasNudge && "bg-[rgba(252,235,235,0.35)]",
                groupSelect && isGroupSelected && "bg-[#faf4e6]/60",
              );

              const avatar = (
                <span className={avatarClass}>
                  {child.name.charAt(0).toUpperCase()}
                </span>
              );

              const details = (
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
              );

              const equityDisplay = (
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
                        {count}{" "}
                        {count === 1 ? "observation" : "observations"}
                      </span>
                    </>
                  )}
                </span>
              );

              const arrowLink = (
                <Link
                  href={`/children/${child.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLoadingId(child.id);
                  }}
                  aria-label={`Open ${child.name}'s profile`}
                  aria-busy={isLoading}
                  className={cn(
                    linkArrowClass,
                    "inline-flex min-w-[2rem] shrink-0 items-center justify-center rounded-md transition-colors hover:bg-[#faf4e6]/80",
                    isLoading && "pointer-events-none opacity-60",
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="size-3.5 animate-spin text-[#c8a85a]" />
                  ) : (
                    "→"
                  )}
                </Link>
              );

              return (
                <li
                  key={child.id}
                  className="border-b border-[rgba(154,124,46,0.08)] last:border-0"
                >
                  {groupSelect ? (
                    <div
                      className={cn(
                        linkRowClass,
                        "transition-opacity duration-150",
                        rowTint,
                      )}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isGroupSelected}
                        aria-label={`Include ${child.name} in group observation`}
                        onClick={(e) => {
                          e.stopPropagation();
                          groupSelect.onToggle(child.id);
                        }}
                        className={cn(
                          "flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11px] leading-none transition-colors",
                          isGroupSelected
                            ? "border-[#9a7c2e] bg-[#9a7c2e] text-white"
                            : "border-[rgba(154,124,46,0.3)] bg-white text-transparent",
                        )}
                      >
                        ✓
                      </button>

                      <Link
                        href={`/children/${child.id}`}
                        onClick={() => setLoadingId(child.id)}
                        aria-busy={isLoading}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-[0.875rem]",
                          isLoading && "pointer-events-none opacity-60",
                        )}
                      >
                        {avatar}
                        {details}
                        {equityDisplay}
                      </Link>

                      {arrowLink}
                    </div>
                  ) : (
                    <Link
                      href={`/children/${child.id}`}
                      onClick={() => setLoadingId(child.id)}
                      aria-busy={isLoading}
                      className={cn(
                        linkRowClass,
                        "transition-opacity duration-150",
                        rowTint,
                        isLoading && "pointer-events-none opacity-60",
                      )}
                    >
                      {avatar}
                      {details}
                      {equityDisplay}
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
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
