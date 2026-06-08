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

type Props = {
  students: Child[];
};

export function StudentList({ students }: Props) {
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

            return (
              <li
                key={child.id}
                className="border-b border-[rgba(154,124,46,0.08)] last:border-0"
              >
                <Link
                  href={`/children/${child.id}`}
                  onClick={() => setLoadingId(child.id)}
                  aria-busy={isLoading}
                  className={cn(
                    linkRowClass,
                    "transition-opacity duration-150",
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
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
