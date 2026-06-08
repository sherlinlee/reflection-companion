"use client";

import { Flame } from "lucide-react";

import { cardClass, sectionLabelClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  observations: { created_at: string }[];
};

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function calcStreak(observations: { created_at: string }[]): number {
  const daysWithObs = new Set(
    observations.map((o) => toDateKey(new Date(o.created_at))),
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (daysWithObs.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getWeekdayDots(observations: { created_at: string }[]) {
  const daySet = new Set(
    observations.map((o) => toDateKey(new Date(o.created_at))),
  );

  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  const diffToMonday = day === 0 ? -6 : 1 - day;
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const labels = ["M", "T", "W", "T", "F"] as const;

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, filled: daySet.has(toDateKey(d)) };
  });
}

export function MomentumStrip({ observations }: Props) {
  const total = observations.length;
  const weekdayDots = getWeekdayDots(observations);
  const streak = calcStreak(observations);

  return (
    <section>
      <h2 className={`${sectionLabelClass} mb-3 flex items-center gap-2`}>
        <Flame className="size-3.5 text-[#c8a85a]" />
        Your momentum this week
      </h2>
      <div className={`${cardClass} flex flex-wrap items-end justify-between gap-4`}>
        <div>
          <p className="font-heading text-[2rem] font-semibold leading-none text-[#0f1a18]">
            {total}
          </p>
          <p className="mt-1 text-[12px] text-[#8a9490]">observations added</p>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex gap-2">
            {weekdayDots.map((dot, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    dot.filled
                      ? "bg-[#9a7c2e]"
                      : "bg-[rgba(154,124,46,0.15)]",
                  )}
                />
                <span className="text-[10px] font-medium text-[#8a9490]">
                  {dot.label}
                </span>
              </div>
            ))}
          </div>

          {streak > 0 && (
            <p className="text-[10px] text-[#8a9490]">
              {streak}-day streak
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
