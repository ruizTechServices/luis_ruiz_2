import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { getDashboardDecisions } from "@/lib/functions/master-dashboard/getDashboardDecisions";
import type { DashboardDecision } from "@/lib/functions/master-dashboard/types";

export const dynamic = "force-dynamic";

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

export default async function NotesPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;

  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  let decisions: DashboardDecision[] = [];
  let loadError: string | null = null;
  try {
    decisions = await getDashboardDecisions({ limit: 200 });
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load decisions";
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] py-8 text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#111827_48%,#062f2f_100%)] dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/gio_dash" className="text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400">
              Back to command center
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Decisions / Notes
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Operational decision memory from{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">
                dashboard_decisions
              </code>
              .
            </p>
          </div>
          <span className="self-start rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {decisions.length} decisions
          </span>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
            Could not load decisions: {loadError}
          </div>
        ) : decisions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-700 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-white">No decisions on file</p>
            <p className="mt-1">
              Add architecture or business decisions through{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">
                POST /api/dashboard/decisions
              </code>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {decisions.map((decision) => (
              <article key={decision.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">{decision.title}</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Created {formatDate(decision.created_at)}
                    </p>
                  </div>
                  <span className="self-start rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {decision.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-700 dark:text-slate-200">
                  {decision.decision}
                </p>
                {decision.reason ? (
                  <p className="mt-3 border-l-2 border-slate-200 pl-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:text-slate-300">
                    {decision.reason}
                  </p>
                ) : null}
                {decision.revisit_at ? (
                  <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-200">
                    Revisit {formatDate(decision.revisit_at)}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
