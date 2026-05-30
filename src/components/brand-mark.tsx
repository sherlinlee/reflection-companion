import Link from "next/link";

export function BrandMark({ compact }: { compact?: boolean }) {
  return (
    <Link
      href="/children"
      className="group inline-flex flex-col gap-1 text-left no-underline"
    >
      <span className="font-heading text-[clamp(1.1rem,3vw,1.35rem)] font-semibold leading-tight tracking-[-0.02em] text-[#0F1A18] group-hover:text-[#1A7A6E] transition-colors">
        {compact ? "Reflection" : "Documentation Reflection"}
      </span>
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#2A9D8F]">
        Spark by Sher
      </span>
    </Link>
  );
}
