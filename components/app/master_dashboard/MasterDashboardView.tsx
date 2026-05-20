import ContentAnalyticsCard from "@/components/app/gio_dashboard/ContentAnalyticsCard";
import ContactsInboxCard from "@/components/app/gio_dashboard/ContactsInboxCard";
import GithubApiTesterCard from "@/components/app/gio_dashboard/GithubApiTesterCard";
import QuickActionsCard from "@/components/app/gio_dashboard/QuickActionsCard";
import SystemHealthCard from "@/components/app/gio_dashboard/SystemHealthCard";
import { getMasterDashboardOverview } from "@/lib/functions/master-dashboard/getMasterDashboardOverview";
import type { MasterDashboardOverview } from "@/lib/functions/master-dashboard/types";
import { ActiveProjectsCard } from "./ActiveProjectsCard";
import { AiToolsCard } from "./AiToolsCard";
import { ContentQueueCard } from "./ContentQueueCard";
import { DashboardHeader } from "./DashboardHeader";
import { DecisionsLogCard } from "./DecisionsLogCard";
import { OpenLeadsCard } from "./OpenLeadsCard";
import { QuickActionsPanel } from "./QuickActionsPanel";
import { RevenueSnapshotCard } from "./RevenueSnapshotCard";
import { SystemLinksCard } from "./SystemLinksCard";
import { TodayFocusCard } from "./TodayFocusCard";

const EMPTY_OVERVIEW: MasterDashboardOverview = {
  projects: [],
  leads: [],
  recent_money: [],
  decisions: [],
  system_links: [],
  money_summary: {
    total_income: 0,
    total_expense: 0,
    net: 0,
    entries_count: 0,
    open_opportunity_value: 0,
  },
  generated_at: new Date().toISOString(),
};

async function loadOverview(): Promise<{ overview: MasterDashboardOverview; loadError: string | null }> {
  try {
    const overview = await getMasterDashboardOverview({
      projectLimit: 5,
      leadLimit: 5,
      moneyLimit: 200,
      decisionLimit: 5,
      systemLinkLimit: 8,
    });
    return { overview, loadError: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error loading dashboard data";
    return { overview: EMPTY_OVERVIEW, loadError: message };
  }
}

export async function MasterDashboardView() {
  const { overview, loadError } = await loadOverview();
  const topProject = overview.projects[0];
  const nextLead = overview.leads[0];
  const latestDecision = overview.decisions[0];

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] py-8 text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#111827_48%,#062f2f_100%)] dark:text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <DashboardHeader />

        {loadError ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
            <p className="font-semibold">Dashboard data could not be loaded.</p>
            <p className="mt-1">
              Cards below render empty states until the dashboard tables are reachable.
              {" "}Detail: {loadError}
            </p>
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <RevenueSnapshotCard summary={overview.money_summary} />
          </div>
          <div className="lg:col-span-4">
            <OpenLeadsCard leads={overview.leads} />
          </div>
          <div className="lg:col-span-4">
            <ActiveProjectsCard projects={overview.projects} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <TodayFocusCard
              topProject={topProject}
              nextLead={nextLead}
              latestDecision={latestDecision}
            />
          </div>
          <div className="lg:col-span-6">
            <QuickActionsPanel />
          </div>
          <div className="lg:col-span-7">
            <SystemLinksCard links={overview.system_links} />
          </div>
          <div className="lg:col-span-5">
            <DecisionsLogCard decisions={overview.decisions} />
          </div>
          <div className="lg:col-span-7">
            <ContentQueueCard />
          </div>
          <div className="lg:col-span-5">
            <AiToolsCard />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/60 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Legacy Admin Tools</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Preserved owner tools from the previous dashboard while the command-center shell evolves.
              </p>
            </div>
            <span className="self-start rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
              Site Admin
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <QuickActionsCard />
            <SystemHealthCard />
            <ContactsInboxCard />
            <GithubApiTesterCard />
            <ContentAnalyticsCard />
          </div>
        </section>
      </div>
    </main>
  );
}
