import "server-only";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { getDashboardSystemLinks } from "@/lib/functions/master-dashboard/getDashboardSystemLinks";
import type { DashboardSystemLink } from "@/lib/functions/master-dashboard/types";

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
  const className =
    "inline-flex items-center rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15";

  if (isInternalHref(item.url)) {
    return (
      <Link href={item.url} className={className}>
        Open
      </Link>
    );
  }

  return (
    <a href={item.url} className={className} target="_blank" rel="noreferrer">
      Open
    </a>
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
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] py-8 text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#111827_48%,#062f2f_100%)] dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/gio_dash" className="text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400">
              Back to command center
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              System Links
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Owner-curated operating destinations from{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">
                dashboard_system_links
              </code>
              .
            </p>
          </div>
          <span className="self-start rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {links.length} links
          </span>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
            Could not load system links: {loadError}
          </div>
        ) : links.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-700 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-white">No system links on file</p>
            <p className="mt-1">
              Add important destinations through{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">
                POST /api/dashboard/system-links
              </code>
              .
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {links.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-950 dark:text-white">{item.name}</p>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{item.type}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{item.status}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">P{item.priority}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatDate(item.updated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <OpenLink item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
