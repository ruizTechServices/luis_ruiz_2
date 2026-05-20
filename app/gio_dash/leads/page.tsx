import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { getDashboardLeads } from "@/lib/functions/master-dashboard/getDashboardLeads";
import type { DashboardLead } from "@/lib/functions/master-dashboard/types";

export const dynamic = "force-dynamic";

function formatBudget(value: number | null): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "—";
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
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] py-8 text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#111827_48%,#062f2f_100%)] dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/gio_dash" className="text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400">
              ← Back to command center
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Leads
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Operational lead pipeline. Read-only list from <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">dashboard_leads</code>.
            </p>
          </div>
          <span className="self-start rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {leads.length} leads
          </span>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
            Could not load leads: {loadError}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-700 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-white">No leads on file</p>
            <p className="mt-1">Add leads through <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">POST /api/dashboard/leads</code>.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {leads.map((lead) => {
                  const title = lead.business_name || lead.name || "Unnamed lead";
                  const subtitle =
                    lead.business_name && lead.name && lead.name !== lead.business_name
                      ? lead.name
                      : null;
                  return (
                    <tr key={lead.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-950 dark:text-white">{title}</p>
                        {subtitle ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                        ) : null}
                        {lead.problem ? (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                            {lead.problem}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{lead.status}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatBudget(lead.budget)}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(lead.next_follow_up_at)}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{lead.source ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
