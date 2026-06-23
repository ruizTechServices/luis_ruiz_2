import "server-only";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { getDashboardLeads } from "@/lib/functions/master-dashboard/getDashboardLeads";
import type { DashboardLead } from "@/lib/functions/master-dashboard/types";
import {
  DashboardCode,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardPageHeader,
  DashboardPageShell,
  DashboardStatusBadge,
  DashboardTableShell,
  dashboardTableBodyClassName,
  dashboardTableCellClassName,
  dashboardTableClassName,
  dashboardTableHeadClassName,
  dashboardTableStrongCellClassName,
} from "@/components/design-system/DashboardPrimitives";

export const dynamic = "force-dynamic";

function formatBudget(value: number | null): string {
  if (value === null || value === undefined) return "-";
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default async function LeadsPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;

  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  let leads: DashboardLead[] = [];
  let loadError: string | null = null;
  try {
    leads = await getDashboardLeads({ limit: 100 });
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load leads";
  }

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Leads"
        description={<>Operational lead pipeline. Read-only list from <DashboardCode>dashboard_leads</DashboardCode>.</>}
        meta={<DashboardStatusBadge>{leads.length} leads</DashboardStatusBadge>}
      />

      {loadError ? (
        <DashboardErrorState>Could not load leads: {loadError}</DashboardErrorState>
      ) : leads.length === 0 ? (
        <DashboardEmptyState title="No leads on file">
          Add leads through <DashboardCode>POST /api/dashboard/leads</DashboardCode>.
        </DashboardEmptyState>
      ) : (
        <DashboardTableShell>
          <table className={dashboardTableClassName}>
            <thead className={dashboardTableHeadClassName}>
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Follow-up</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody className={dashboardTableBodyClassName}>
              {leads.map((lead) => {
                const title = lead.business_name || lead.name || "Unnamed lead";
                const subtitle =
                  lead.business_name && lead.name && lead.name !== lead.business_name
                    ? lead.name
                    : null;
                return (
                  <tr key={lead.id} className="transition hover:bg-[var(--color-surface-raised)]">
                    <td className={dashboardTableStrongCellClassName}>
                      <p>{title}</p>
                      {subtitle ? (
                        <p className="text-xs font-normal text-[var(--color-text-subtle)]">{subtitle}</p>
                      ) : null}
                      {lead.problem ? (
                        <p className="mt-1 line-clamp-2 text-xs font-normal text-[var(--color-text-secondary)]">
                          {lead.problem}
                        </p>
                      ) : null}
                    </td>
                    <td className={dashboardTableCellClassName}>{lead.status}</td>
                    <td className={dashboardTableCellClassName}>{formatBudget(lead.budget)}</td>
                    <td className={dashboardTableCellClassName}>{formatDate(lead.next_follow_up_at)}</td>
                    <td className={dashboardTableCellClassName}>{lead.source ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DashboardTableShell>
      )}
    </DashboardPageShell>
  );
}
