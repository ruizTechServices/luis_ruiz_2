import ContentAnalyticsCard from "@/components/app/gio_dashboard/ContentAnalyticsCard";
import ContactsInboxCard from "@/components/app/gio_dashboard/ContactsInboxCard";
import GithubApiTesterCard from "@/components/app/gio_dashboard/GithubApiTesterCard";
import { Logo } from "@/components/design-system/Logo";
import { ThemeToggle } from "@/components/design-system/ThemeToggle";
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
import Link from "next/link";

const adminNav = [
  { label: "Overview", href: "/gio_dash" },
  { label: "Leads", href: "/gio_dash/leads" },
  { label: "Projects", href: "/gio_dash/projects" },
  { label: "Money", href: "/gio_dash/money" },
  { label: "Publishing", href: "/gio_dash/blog" },
  { label: "Systems", href: "/gio_dash/systems" },
  { label: "Notes", href: "/gio_dash/notes" },
];

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
    <main className="min-h-screen bg-[var(--color-canvas)] py-6 text-[var(--color-text-primary)]">
      <div className="ss-container grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="ss-panel hidden min-h-[calc(100vh-8rem)] flex-col justify-between p-4 lg:flex">
          <div className="space-y-6">
            <Logo />
            <div className="ss-muted-panel p-3">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Gio / Owner</p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Private operations</p>
            </div>
            <nav aria-label="Owner dashboard navigation" className="grid gap-1">
              {adminNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="min-h-11 rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:bg-[var(--color-canvas)] hover:text-[var(--color-text-primary)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <p className="font-technical text-[0.55rem] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
            Owner access / Server verified
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <div className="ss-panel flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">Studio operations</p>
              <p className="font-technical text-[0.58rem] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                Owner command deck / New York
              </p>
            </div>
            <ThemeToggle />
          </div>

          <DashboardHeader />

          {loadError ? (
          <div className="rounded-[var(--radius-panel)] border border-[var(--color-signal-warning)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-primary)]">
            <p className="font-semibold">Dashboard data could not be loaded.</p>
            <p className="mt-1">
              Cards below render empty states until the dashboard tables are reachable.
              {" "}Detail: {loadError}
            </p>
          </div>
          ) : null}

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
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

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
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

          <section className="ss-panel p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Preserved Admin Tools</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Preserved owner tools from the previous dashboard while the command-center shell evolves.
              </p>
            </div>
            <span className="self-start rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
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
      </div>
    </main>
  );
}
