import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all duration-[var(--motion-fast)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-action-primary)] text-[var(--color-action-on-primary)] shadow-xs hover:bg-[var(--color-action-primary-hover)]",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs hover:border-[var(--color-border-strong)] hover:bg-[var(--color-canvas)]",
        secondary:
          "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-xs hover:bg-[var(--color-canvas)]",
        ghost:
          "text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]",
        link: "text-[var(--color-action-primary)] underline-offset-4 hover:underline",
        cta: "bg-[var(--color-action-primary)] text-[var(--color-action-on-primary)] shadow-[var(--shadow-level-1)] hover:bg-[var(--color-action-primary-hover)] active:scale-[0.98]",
        "cta-outline":
          "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-canvas)]",
      },
      size: {
        default: "min-h-11 px-4 py-2 has-[>svg]:px-3",
        sm: "min-h-9 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "min-h-12 px-6 has-[>svg]:px-4",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
