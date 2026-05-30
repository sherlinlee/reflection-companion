import { cn } from "@/lib/utils";

export function ReflectionSection({
  title,
  intro,
  items,
  className,
  variant = "default",
}: {
  title: string;
  intro: string;
  items: string[];
  className?: string;
  variant?: "default" | "highlight";
}) {
  return (
    <section
      className={cn(
        "rounded-r-lg border-l-[3px] p-5",
        variant === "highlight"
          ? "border-[#1A7A6E] bg-[#EAF5F3]"
          : "border-[#1A7A6E] bg-[#ffffff] shadow-[0_2px_10px_rgba(26,122,110,0.05)]",
        className,
      )}
    >
      <h3 className="font-heading text-[clamp(1.05rem,3vw,1.2rem)] font-semibold leading-[1.28] text-[#0F1A18]">
        {title}
      </h3>
      <p className="mt-1 mb-4 text-[14px] leading-[1.75] text-[#7A9490]">
        {intro}
      </p>
      <ul className="space-y-3 text-[15.5px] leading-[1.6] text-[#3D4F4C]">
        {items.map((item) => (
          <li key={item} className="flex gap-3 border-b border-[rgba(168,213,207,0.4)] pb-3 last:border-0 last:pb-0">
            <span
              className="mt-2 size-1.5 shrink-0 rounded-full bg-[#1A7A6E]"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
