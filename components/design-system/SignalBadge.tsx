import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type SignalTone =
  | "neutral"
  | "orange"
  | "mint"
  | "violet"
  | "warning"
  | "danger"
  | "info";

const toneClasses: Record<SignalTone, string> = {
  neutral: "border-[var(--color-border)] text-[var(--color-text-secondary)]",
  orange: "border-[var(--color-action-primary)] text-[var(--color-action-primary)]",
  mint: "border-[var(--color-signal-mint)] text-[var(--color-signal-mint)]",
  violet: "border-[var(--color-signal-violet)] text-[var(--color-signal-violet)]",
  warning: "border-[var(--color-signal-warning)] text-[var(--color-signal-warning)]",
  danger: "border-[var(--color-signal-danger)] text-[var(--color-signal-danger)]",
  info: "border-[var(--color-signal-info)] text-[var(--color-signal-info)]",
};

export function SignalBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: SignalTone;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full bg-[var(--color-surface)] px-2.5 py-1 font-technical text-[0.625rem] font-medium uppercase tracking-[0.04em]",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </Badge>
  );
}
