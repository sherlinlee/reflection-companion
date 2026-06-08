"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<typeof Button> & {
  pendingLabel?: React.ReactNode;
};

export function FormSubmitButton({
  children,
  pendingLabel,
  className,
  disabled,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className={cn(pending && "opacity-90", className)}
      {...props}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {pending && pendingLabel !== undefined ? pendingLabel : children}
    </Button>
  );
}
