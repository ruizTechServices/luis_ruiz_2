import { CalendarDays } from "lucide-react";
import { SignalBadge } from "@/components/design-system/SignalBadge";

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date());
}

export function DashboardHeader() {
  return (
    <header className="ss-panel p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <SignalBadge tone="mint">Owner authenticated</SignalBadge>
          <h1 className="mt-4 text-3xl font-bold tracking-normal text-[var(--color-text-primary)] sm:text-4xl">
            Owner operating system
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            Private operating shell for ruizTechServices, luis-ruiz.com, public
            content, client-facing systems, and AI product work.
          </p>
        </div>

        <div className="ss-muted-panel px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <CalendarDays className="h-4 w-4 text-[var(--color-action-primary)]" />
            Today
          </div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{formatToday()}</p>
        </div>
      </div>
    </header>
  );
}
