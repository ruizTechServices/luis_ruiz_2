import { ClientDashboardHeader } from "./ClientDashboardHeader";
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
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_48%,#f0fdfa_100%)] py-8 text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_48%,#052e2b_100%)] dark:text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <ClientDashboardHeader userEmail={userEmail} />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
    </main>
  );
}
