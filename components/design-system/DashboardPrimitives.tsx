import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "ss-panel h-full p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function DashboardIconTile({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "mint" | "violet" | "warning" | "info" | "danger";
}) {
  const toneClass = {
    default: "bg-[var(--color-action-primary)] text-[var(--color-action-on-primary)]",
    mint: "bg-[color-mix(in_srgb,var(--color-signal-mint),transparent_86%)] text-[var(--color-signal-mint)]",
    violet: "bg-[color-mix(in_srgb,var(--color-signal-violet),transparent_86%)] text-[var(--color-signal-violet)]",
    warning: "bg-[color-mix(in_srgb,var(--color-signal-warning),transparent_84%)] text-[var(--color-signal-warning)]",
    info: "bg-[color-mix(in_srgb,var(--color-signal-info),transparent_86%)] text-[var(--color-signal-info)]",
    danger: "bg-[color-mix(in_srgb,var(--color-signal-danger),transparent_86%)] text-[var(--color-signal-danger)]",
  }[tone];

  return (
    <span className={cn("inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)]", toneClass)}>
      {children}
    </span>
  );
}

export function DashboardEmptyState({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-5 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] p-4 text-sm text-[var(--color-text-secondary)]",
        className,
      )}
    >
      <p className="font-semibold text-[var(--color-text-primary)]">{title}</p>
      <div className="mt-2 leading-6">{children}</div>
    </div>
  );
}

export const dashboardItemClassName =
  "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4";

export const dashboardActionClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-xs font-semibold text-[var(--color-text-primary)] transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-raised)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]";
