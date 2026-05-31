import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg]:transition-transform [&_svg]:duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.98] hover:[&_svg]:scale-110",
        cta:
          "spark-cta-shimmer min-h-11 rounded-full bg-[#E8A045] px-6 font-heading text-base font-bold italic tracking-[0.01em] text-[#1A1A1A] shadow-[0_6px_24px_rgba(232,160,69,0.45),0_2px_8px_rgba(0,0,0,0.2)] hover:bg-[#F0B05A] hover:scale-[1.03] active:scale-[0.98] hover:[&_svg]:rotate-12",
        outline:
          "border-border bg-background shadow-sm hover:border-[#C8A85A]/40 hover:bg-[#FAF4E6] hover:text-[#9A7C2E] hover:shadow-md aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md active:scale-[0.98]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground aria-expanded:bg-accent aria-expanded:text-accent-foreground",
        destructive:
          "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15 hover:border-destructive/50 shadow-sm",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-3 py-1.5",
        xs:      "h-6 gap-1 px-2 text-xs",
        sm:      "h-7 gap-1.5 px-2.5 text-xs",
        lg:      "h-10 gap-2 px-4 text-sm",
        icon:    "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };