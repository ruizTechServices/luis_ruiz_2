import { getDashboardProjects } from "./getDashboardProjects";
import { getDashboardLeads } from "./getDashboardLeads";
import { getDashboardMoney, summarizeMoneyEntries } from "./getDashboardMoney";
import { getDashboardDecisions } from "./getDashboardDecisions";
import { getDashboardSystemLinks } from "./getDashboardSystemLinks";
import type { MasterDashboardOverview } from "./types";

export type GetMasterDashboardOverviewOptions = {
  projectLimit?: number;
  leadLimit?: number;
  moneyLimit?: number;
  decisionLimit?: number;
  systemLinkLimit?: number;
};

export async function getMasterDashboardOverview(
  options: GetMasterDashboardOverviewOptions = {}
): Promise<MasterDashboardOverview> {
  const projectLimit = options.projectLimit ?? 5;
  const leadLimit = options.leadLimit ?? 5;
  const moneyLimit = options.moneyLimit ?? 100;
  const decisionLimit = options.decisionLimit ?? 5;
  const systemLinkLimit = options.systemLinkLimit ?? 8;

  const [projects, leads, recent_money, decisions, system_links] = await Promise.all([
    getDashboardProjects({ activeOnly: true, limit: projectLimit }),
    getDashboardLeads({ openOnly: true, limit: leadLimit }),
    getDashboardMoney({ limit: moneyLimit }),
    getDashboardDecisions({ status: "active", limit: decisionLimit }),
    getDashboardSystemLinks({ status: "active", limit: systemLinkLimit }),
  ]);

  return {
    projects,
    leads,
    recent_money,
    decisions,
    system_links,
    money_summary: summarizeMoneyEntries(recent_money, {
      openLeads: leads,
      openProjects: projects,
    }),
    generated_at: new Date().toISOString(),
  };
}
