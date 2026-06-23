import { ClientDashboardHeader } from "./ClientDashboardHeader";
import { Logo } from "@/components/design-system/Logo";
import { ThemeToggle } from "@/components/design-system/ThemeToggle";
import { ClientDeliverablesCard } from "./ClientDeliverablesCard";
import { ClientInvoicesCard } from "./ClientInvoicesCard";
import { ClientMessagesCard } from "./ClientMessagesCard";
import { ClientProjectStatusCard } from "./ClientProjectStatusCard";
import { ClientSupportCard } from "./ClientSupportCard";
import { ClientUpdatesCard } from "./ClientUpdatesCard";

export type ClientDashboardViewProps = {
  userEmail?: string | null;
};

export function ClientDashboardView({ userEmail }: ClientDashboardViewProps) {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] py-6 text-[var(--color-text-primary)]">
      <div className="ss-container grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="ss-panel hidden min-h-[calc(100vh-8rem)] flex-col justify-between p-4 lg:flex">
          <div className="space-y-6">
            <Logo />
            <div className="ss-muted-panel p-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Client project room</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Shared project access</p>
            </div>
            <nav aria-label="Client dashboard navigation" className="grid gap-1">
              {["Overview", "Timeline", "Messages", "Files", "Invoices"].map((item) => (
                <span
                  key={item}
                  className="min-h-11 rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] first:border first:border-[var(--color-border)] first:bg-[var(--color-surface)] first:text-[var(--color-text-primary)]"
                >
                  {item}
                </span>
              ))}
            </nav>
          </div>
          <p className="font-technical text-[0.55rem] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
            Client access / Project scoped
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="ss-panel flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Project room</p>
              <p className="font-technical text-[0.58rem] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                No project data connected yet
              </p>
            </div>
            <ThemeToggle />
          </div>

          <ClientDashboardHeader userEmail={userEmail} />

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="lg:col-span-7">
            <ClientProjectStatusCard />
          </div>
          <div className="lg:col-span-5">
            <ClientUpdatesCard />
          </div>
          <div className="lg:col-span-4">
            <ClientDeliverablesCard />
          </div>
          <div className="lg:col-span-4">
            <ClientInvoicesCard />
          </div>
          <div className="lg:col-span-4">
            <ClientMessagesCard />
          </div>
          <div className="lg:col-span-12">
            <ClientSupportCard />
          </div>
          </section>
        </div>
      </div>
    </main>
  );
}
