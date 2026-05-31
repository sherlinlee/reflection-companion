import { cn } from "@/lib/utils";

type ReflectionVariant = "patterns" | "questions" | "connections";

const variantConfig: Record<
  ReflectionVariant,
  {
    strip: string;
    badge: string;
    badgeIcon: string;
    label: string;
    dot: string;
    divider: string;
  }
> = {
  patterns: {
    strip: "bg-[#BA7517]",
    badge: "bg-[#FAEEDA] text-[#854F0B]",
    badgeIcon: "ti-chart-dots",
    label: "text-[#854F0B]",
    dot: "bg-[#BA7517]",
    divider: "border-[rgba(186,117,23,0.12)]",
  },
  questions: {
    strip: "bg-[#7F77DD]",
    badge: "bg-[#EEEDFE] text-[#534AB7]",
    badgeIcon: "ti-question-mark",
    label: "text-[#534AB7]",
    dot: "bg-[#7F77DD]",
    divider: "border-[rgba(127,119,221,0.12)]",
  },
  connections: {
    strip: "bg-[#1D9E75]",
    badge: "bg-[#E1F5EE] text-[#0F6E56]",
    badgeIcon: "ti-arrows-join",
    label: "text-[#0F6E56]",
    dot: "bg-[#1D9E75]",
    divider: "border-[rgba(29,158,117,0.12)]",
  },
};

export function ReflectionSection({
  title,
  intro,
  items,
  className,
  variant = "patterns",
}: {
  title: string;
  intro: string;
  items: string[];
  className?: string;
  variant?: ReflectionVariant;
}) {
  const config = variantConfig[variant];

  return (
    <section
      className={cn(
        "flex overflow-hidden rounded-lg border border-[rgba(0,0,0,0.07)] bg-white",
        className,
      )}
    >
      {/* Colored left strip */}
      <div className={cn("w-[3px] flex-shrink-0", config.strip)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-[rgba(0,0,0,0.06)] px-3.5 py-3">
          <div
            className={cn(
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[15px]",
              config.badge,
            )}
          >
            <i className={`ti ${config.badgeIcon}`} aria-hidden="true" />
          </div>
          <div>
            <p
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.18em]",
                config.label,
              )}
            >
              {title}
            </p>
            <p className="text-[11px] leading-[1.5] text-[#8a9490]">{intro}</p>
          </div>
        </div>

        {/* Items */}
        <ul className="px-3.5 pb-3">
          {items.map((item) => (
            <li
              key={item}
              className={cn(
                "flex items-start gap-2 py-2 text-[13px] leading-[1.55] text-[#3d4f4c]",
                "border-b last:border-0",
                config.divider,
              )}
            >
              <span
                className={cn(
                  "mt-[6px] h-[5px] w-[5px] flex-shrink-0 rounded-full",
                  config.dot,
                )}
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}