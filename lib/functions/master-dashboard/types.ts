// Typed contracts for the Master Dashboard (owner command center) data layer.
// These mirror the rows in supabase/migrations/20260519_create_master_dashboard_tables.sql.
// They are intentionally separate from the UI shell types in
// components/app/master_dashboard/types.ts.

export type DashboardProjectType = "internal" | "client" | "product" | "experiment" | string;
export type DashboardProjectStatus =
  | "idea"
  | "validated"
  | "building"
  | "testing"
  | "shipped"
  | "selling"
  | "paused"
  | "archived"
  | string;

export type DashboardProject = {
  id: string;
  name: string;
  slug: string;
  type: DashboardProjectType;
  status: DashboardProjectStatus;
  priority: number;
  repo_url: string | null;
  live_url: string | null;
  description: string | null;
  next_action: string | null;
  revenue_potential: number | null;
  last_touched_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardLeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal_sent"
  | "deposit_paid"
  | "in_progress"
  | "won"
  | "lost"
  | string;

export type DashboardLead = {
  id: string;
  name: string | null;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  problem: string | null;
  budget: number | null;
  status: DashboardLeadStatus;
  next_follow_up_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardClientStatus = "active" | "paused" | "former" | string;

export type DashboardClient = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  business_name: string | null;
  status: DashboardClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardMoneyEntryType = "income" | "expense" | string;

export type DashboardMoneyEntry = {
  id: string;
  entry_type: DashboardMoneyEntryType;
  category: string;
  description: string | null;
  amount: number;
  occurred_on: string;
  project_id: string | null;
  client_id: string | null;
  created_at: string;
};

export type DashboardDecisionStatus = "active" | "revisit" | "retired" | string;

export type DashboardDecision = {
  id: string;
  title: string;
  decision: string;
  reason: string | null;
  project_id: string | null;
  status: DashboardDecisionStatus;
  revisit_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardSystemLinkType =
  | "website"
  | "repo"
  | "deployment"
  | "database"
  | "ai_tool"
  | "product"
  | "admin"
  | "external"
  | string;
export type DashboardSystemLinkStatus =
  | "active"
  | "paused"
  | "needs_review"
  | "broken"
  | "archived"
  | string;

export type DashboardSystemLink = {
  id: string;
  name: string;
  url: string;
  description: string | null;
  type: DashboardSystemLinkType;
  status: DashboardSystemLinkStatus;
  priority: number;
  created_at: string;
  updated_at: string;
};

export type MasterDashboardMoneySummary = {
  total_income: number;
  total_expense: number;
  net: number;
  entries_count: number;
  open_opportunity_value: number;
};

export type MasterDashboardOverview = {
  projects: DashboardProject[];
  leads: DashboardLead[];
  recent_money: DashboardMoneyEntry[];
  decisions: DashboardDecision[];
  system_links: DashboardSystemLink[];
  money_summary: MasterDashboardMoneySummary;
  generated_at: string;
};
