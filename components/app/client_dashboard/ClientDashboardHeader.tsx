import { CheckCircle2, LayoutDashboard } from "lucide-react";
import { SignalBadge } from "@/components/design-system/SignalBadge";

export type ClientDashboardHeaderProps = {
  userEmail?: string | null;
};

export function ClientDashboardHeader({ userEmail }: ClientDashboardHeaderProps) {
  return (
    <header className="ss-panel p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <LayoutDashboard className="h-4 w-4" />
            <SignalBadge tone="violet">Project-scoped access</SignalBadge>
          </div>
          <h1 className="text-3xl font-bold tracking-normal text-[var(--color-text-primary)] sm:text-4xl">
            Client project room
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
            Welcome. This area will track your project status, deliverables,
            updates, and communication with Gio/ruizTechServices.
          </p>
        </div>

        <div className="ss-muted-panel px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-signal-mint)]" />
            Signed in
          </div>
          <p className="mt-1 max-w-[16rem] truncate text-sm text-[var(--color-text-secondary)]">
            {userEmail ?? "Client account"}
          </p>
        </div>
      </div>
    </header>
  );
}
