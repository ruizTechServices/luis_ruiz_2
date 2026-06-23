import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { getDashboardSystemLinks } from "@/lib/functions/master-dashboard/getDashboardSystemLinks";
import type { DashboardSystemLink } from "@/lib/functions/master-dashboard/types";
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

function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

function formatDate(value: string): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function OpenLink({ item }: { item: DashboardSystemLink }) {
  if (isInternalHref(item.url)) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href={item.url}>Open</Link>
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <a href={item.url} target="_blank" rel="noreferrer">
        Open
      </a>
    </Button>
  );
}

export default async function SystemsPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;

  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  let links: DashboardSystemLink[] = [];
  let loadError: string | null = null;
  try {
    links = await getDashboardSystemLinks({ limit: 200 });
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load system links";
  }

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="System Links"
        description={<>Owner-curated operating destinations from <DashboardCode>dashboard_system_links</DashboardCode>.</>}
        meta={<DashboardStatusBadge>{links.length} links</DashboardStatusBadge>}
      />

      {loadError ? (
        <DashboardErrorState>Could not load system links: {loadError}</DashboardErrorState>
      ) : links.length === 0 ? (
        <DashboardEmptyState title="No system links on file">
          Add important destinations through <DashboardCode>POST /api/dashboard/system-links</DashboardCode>.
        </DashboardEmptyState>
      ) : (
        <DashboardTableShell>
          <table className={dashboardTableClassName}>
            <thead className={dashboardTableHeadClassName}>
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Open</th>
              </tr>
            </thead>
            <tbody className={dashboardTableBodyClassName}>
              {links.map((item) => (
                <tr key={item.id} className="transition hover:bg-[var(--color-surface-raised)]">
                  <td className={dashboardTableStrongCellClassName}>
                    <p>{item.name}</p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs font-normal text-[var(--color-text-secondary)]">
                        {item.description}
                      </p>
                    ) : null}
                  </td>
                  <td className={dashboardTableCellClassName}>{item.type}</td>
                  <td className={dashboardTableCellClassName}>{item.status}</td>
                  <td className={dashboardTableCellClassName}>P{item.priority}</td>
                  <td className={dashboardTableCellClassName}>{formatDate(item.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <OpenLink item={item} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTableShell>
      )}
    </DashboardPageShell>
  );
}
