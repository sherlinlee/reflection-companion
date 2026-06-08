"use client";

import { Plus } from "lucide-react";

import { ActionLink } from "@/components/action-link";
import { cn } from "@/lib/utils";

type Props = {
  childId: string;
  className?: string;
};

export function AddObservationButton({ childId, className }: Props) {
  return (
    <ActionLink
      href={`/children/${childId}/observations/new`}
      spinnerClassName="size-4"
      pendingLabel="Opening…"
      className={cn(
        "spark-cta-shimmer inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[#E8A045] px-6 font-heading text-base font-bold italic tracking-[0.01em] text-[#1A1A1A] shadow-[0_6px_24px_rgba(232,160,69,0.45),0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-200 hover:scale-[1.03] hover:bg-[#F0B05A] active:scale-[0.98]",
        className,
      )}
    >
      <Plus className="size-4" />
      Add observation
    </ActionLink>
  );
}
