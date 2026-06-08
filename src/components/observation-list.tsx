"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import type { Observation } from "@/lib/types";
import { linkArrowClass, linkRowClass, listPanelClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  observations: Observation[];
};

export function ObservationList({ observations }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <ul className={listPanelClass}>
      {observations.map((obs) => {
        const isLoading = loadingId === obs.id;

        return (
          <li
            key={obs.id}
            className="border-b border-[rgba(154,124,46,0.08)] last:border-0"
          >
            <Link
              href={`/observations/${obs.id}`}
              onClick={() => setLoadingId(obs.id)}
              aria-busy={isLoading}
              className={cn(
                linkRowClass,
                "transition-opacity duration-150",
                isLoading && "pointer-events-none opacity-60",
              )}
            >
              <span className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13.5px] leading-relaxed text-[#0f1a18]">
                  {obs.observation_text}
                </p>
                <time
                  dateTime={obs.created_at}
                  className="mt-1 block text-[11px] text-[#8a9490]"
                >
                  {new Date(obs.created_at).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </time>
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
  );
}
