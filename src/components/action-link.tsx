"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Link> & {
  spinnerClassName?: string;
  pendingLabel?: React.ReactNode;
};

/** Link with immediate pressed/loading feedback on navigation. */
export function ActionLink({
  href,
  className,
  children,
  spinnerClassName,
  pendingLabel,
  onClick,
  ...props
}: Props) {
  const [pending, setPending] = useState(false);

  return (
    <Link
      href={href}
      aria-busy={pending}
      onClick={(e) => {
        setPending(true);
        onClick?.(e);
      }}
      className={cn(
        className,
        pending && "pointer-events-none opacity-70",
      )}
      {...props}
    >
      {pending ? (
        <>
          <Loader2
            className={cn("size-3.5 shrink-0 animate-spin", spinnerClassName)}
          />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Link>
  );
}
