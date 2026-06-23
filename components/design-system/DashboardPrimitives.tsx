import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function DashboardCard({
  children,
  className,
  as = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "aside" | "article" | "div";
}) {
  const Comp = as;

  return (
    <Comp
      className={cn(
        "ss-panel h-full p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function DashboardPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("min-h-screen bg-[var(--color-canvas)] py-8 text-[var(--color-text-primary)]", className)}>
      <div className="ss-container flex flex-col gap-6">
        {children}
      </div>
    </main>
  );
}

export function DashboardPageHeader({
  title,
  description,
  backHref = "/gio_dash",
  backLabel = "Back to command center",
  meta,
  actions,
}: {
  title: string;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <Link
          href={backHref}
          className="text-xs font-semibold text-[var(--color-text-subtle)] underline-offset-4 transition hover:text-[var(--color-text-primary)] hover:underline"
        >
          {backLabel}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        {description ? (
          <div className="mt-2 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            {description}
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {meta}
        {actions}
      </div>
    </header>
  );
}

export function DashboardErrorState({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-signal-warning),transparent_55%)] bg-[color-mix(in_srgb,var(--color-signal-warning),transparent_90%)] p-4 text-sm leading-6 text-[var(--color-text-primary)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DashboardStatusBadge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: "default" | "mint" | "violet" | "warning" | "danger" | "info";
  className?: string;
}) {
  const toneClass = {
    default: "border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-secondary)]",
    mint: "border-[color-mix(in_srgb,var(--color-signal-mint),transparent_66%)] bg-[color-mix(in_srgb,var(--color-signal-mint),transparent_90%)] text-[var(--color-signal-mint)]",
    violet: "border-[color-mix(in_srgb,var(--color-signal-violet),transparent_66%)] bg-[color-mix(in_srgb,var(--color-signal-violet),transparent_90%)] text-[var(--color-signal-violet)]",
    warning: "border-[color-mix(in_srgb,var(--color-signal-warning),transparent_62%)] bg-[color-mix(in_srgb,var(--color-signal-warning),transparent_90%)] text-[var(--color-signal-warning)]",
    danger: "border-[color-mix(in_srgb,var(--color-signal-danger),transparent_64%)] bg-[color-mix(in_srgb,var(--color-signal-danger),transparent_90%)] text-[var(--color-signal-danger)]",
    info: "border-[color-mix(in_srgb,var(--color-signal-info),transparent_66%)] bg-[color-mix(in_srgb,var(--color-signal-info),transparent_90%)] text-[var(--color-signal-info)]",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex min-h-8 items-center rounded-[var(--radius-sm)] border px-3 py-1 text-xs font-semibold",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function DashboardTableShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ss-panel overflow-hidden shadow-[var(--shadow-card)]", className)}>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export function DashboardCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-primary)]">
      {children}
    </code>
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

export const dashboardTableClassName = "min-w-full text-left text-sm";

export const dashboardTableHeadClassName =
  "border-b border-[var(--color-border)] bg-[var(--color-surface-raised)] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]";

export const dashboardTableBodyClassName = "divide-y divide-[var(--color-border)]";

export const dashboardTableCellClassName = "px-4 py-3 text-[var(--color-text-secondary)]";

export const dashboardTableStrongCellClassName = "px-4 py-3 font-semibold text-[var(--color-text-primary)]";
