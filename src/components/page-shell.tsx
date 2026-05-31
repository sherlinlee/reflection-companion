import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { pageEnterClass, pageWrapClass, staggerClass } from "@/lib/ui-classes";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(pageWrapClass, className)}>
      {children}
    </div>
  );
}
