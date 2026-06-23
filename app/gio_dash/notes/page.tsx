import "server-only";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { getDashboardDecisions } from "@/lib/functions/master-dashboard/getDashboardDecisions";
import type { DashboardDecision } from "@/lib/functions/master-dashboard/types";
import {
  DashboardCard,
  DashboardCode,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardPageHeader,
  DashboardPageShell,
  DashboardStatusBadge,
} from "@/components/design-system/DashboardPrimitives";

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
    <DashboardPageShell>
      <DashboardPageHeader
        title="Decisions / Notes"
        description={<>Operational decision memory from <DashboardCode>dashboard_decisions</DashboardCode>.</>}
        meta={<DashboardStatusBadge>{decisions.length} decisions</DashboardStatusBadge>}
      />

      {loadError ? (
        <DashboardErrorState>Could not load decisions: {loadError}</DashboardErrorState>
      ) : decisions.length === 0 ? (
        <DashboardEmptyState title="No decisions on file">
          Add architecture or business decisions through <DashboardCode>POST /api/dashboard/decisions</DashboardCode>.
        </DashboardEmptyState>
      ) : (
        <div className="grid gap-4">
          {decisions.map((decision) => (
            <DashboardCard key={decision.id} as="article">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{decision.title}</h2>
                  <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                    Created {formatDate(decision.created_at)}
                  </p>
                </div>
                <DashboardStatusBadge tone="mint">{decision.status}</DashboardStatusBadge>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                {decision.decision}
              </p>
              {decision.reason ? (
                <p className="mt-3 border-l-2 border-[var(--color-border)] pl-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {decision.reason}
                </p>
              ) : null}
              {decision.revisit_at ? (
                <p className="mt-3 text-xs font-medium text-[var(--color-signal-warning)]">
                  Revisit {formatDate(decision.revisit_at)}
                </p>
              ) : null}
            </DashboardCard>
          ))}
        </div>
      )}
    </DashboardPageShell>
  );
}
