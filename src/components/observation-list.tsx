"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

import type { Observation } from "@/lib/types";
import { fieldClass, linkArrowClass, linkRowClass, listPanelClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  observations: Observation[];
};

export function ObservationList({ observations }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return observations;
    return observations.filter((obs) =>
      obs.observation_text.toLowerCase().includes(query),
    );
  }, [observations, search]);

  return (
    <div className="flex flex-col gap-3">
      {observations.length > 0 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#8a9490]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search observations…"
            aria-label="Search observations"
            className={cn(fieldClass, "pl-9")}
          />
        </div>
      )}

      {observations.length === 0 ? null : filtered.length === 0 ? (
        <p className="text-[13px] text-[#8a9490]">
          No observations match your search.
        </p>
      ) : (
        <ul className={listPanelClass}>
          {filtered.map((obs) => {
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
                      dateTime={obs.observed_at}
                      className="mt-1 block text-[11px] text-[#8a9490]"
                    >
                      {new Date(obs.observed_at).toLocaleDateString(undefined, {
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
      )}
    </div>
  );
}
