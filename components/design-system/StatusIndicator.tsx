import { cn } from "@/lib/utils";
import type { SignalTone } from "./SignalBadge";
import type { ReactNode } from "react";

const toneClasses: Record<SignalTone, string> = {
  neutral: "border-[var(--color-border)] text-[var(--color-text-secondary)] before:bg-[var(--color-text-subtle)]",
  orange: "border-[var(--color-action-primary)] text-[var(--color-text-primary)] before:bg-[var(--color-action-primary)]",
  mint: "border-[var(--color-signal-mint)] text-[var(--color-text-primary)] before:bg-[var(--color-signal-mint)]",
  violet: "border-[var(--color-signal-violet)] text-[var(--color-text-primary)] before:bg-[var(--color-signal-violet)]",
  warning: "border-[var(--color-signal-warning)] text-[var(--color-text-primary)] before:bg-[var(--color-signal-warning)]",
  danger: "border-[var(--color-signal-danger)] text-[var(--color-text-primary)] before:bg-[var(--color-signal-danger)]",
  info: "border-[var(--color-signal-info)] text-[var(--color-text-primary)] before:bg-[var(--color-signal-info)]",
};

export function StatusIndicator({
  children,
  tone = "mint",
  className,
}: {
  children: ReactNode;
  tone?: SignalTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border bg-[var(--color-surface)] px-2.5 py-1 font-technical text-[0.625rem] font-medium uppercase tracking-[0.04em] before:size-1.5 before:rounded-full",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
