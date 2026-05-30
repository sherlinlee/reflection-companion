import Link from "next/link";

import { cn } from "@/lib/utils";

export function BrandMark({
  compact,
  variant = "header",
}: {
  compact?: boolean;
  variant?: "header" | "login";
}) {
  return (
    <Link
      href="/children"
      className={cn(
        "spark-brand group transition-transform duration-200 hover:translate-x-0.5",
        variant === "login" && "spark-brand--login text-center",
      )}
    >
      <span className="spark-brand-title transition-colors duration-200 group-hover:text-[#1A7A6E]">
        {compact ? "Reflection" : "Documentation Reflection"}
      </span>
      <span className="spark-brand-eyebrow transition-colors duration-200 group-hover:text-[#1A7A6E]">
        Spark by Sher
      </span>
    </Link>
  );
}
