import { FolderKanban } from "lucide-react";

export function ClientProjectStatusCard() {
  return (
    <section className="ss-panel h-full p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Project Status</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
            No active client project is connected to this account yet.
          </p>
        </div>
        <span className="rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] p-2 text-[var(--color-signal-mint)]">
          <FolderKanban className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="ss-muted-panel p-4">
          <p className="font-technical text-[0.65rem] font-medium uppercase text-[var(--color-text-subtle)]">Status</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">Waiting for setup</p>
        </div>
        <div className="ss-muted-panel p-4">
          <p className="font-technical text-[0.65rem] font-medium uppercase text-[var(--color-text-subtle)]">Next step</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">Project kickoff</p>
        </div>
        <div className="ss-muted-panel p-4">
          <p className="font-technical text-[0.65rem] font-medium uppercase text-[var(--color-text-subtle)]">Access</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">Client-only</p>
        </div>
      </div>
    </section>
  );
}
