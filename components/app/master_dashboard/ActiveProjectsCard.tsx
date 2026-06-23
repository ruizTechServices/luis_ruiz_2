import Link from "next/link";
import { ExternalLink, FolderKanban, Github } from "lucide-react";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardIconTile,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import { SignalBadge, type SignalTone } from "@/components/design-system/SignalBadge";
import type { DashboardProject } from "@/lib/functions/master-dashboard/types";

function formatTouched(value: string | null): string | null {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

function statusTone(status: string): SignalTone {
  const normalized = status.toLowerCase();
  if (normalized === "shipped" || normalized === "selling") return "mint";
  if (normalized === "building" || normalized === "testing") return "info";
  if (normalized === "validated") return "violet";
  if (normalized === "idea") return "warning";
  return "neutral";
}

export type ActiveProjectsCardProps = {
  projects: DashboardProject[];
};

export function ActiveProjectsCard({ projects }: ActiveProjectsCardProps) {
  const visible = projects.slice(0, 5);

  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Active Projects</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {visible.length > 0
              ? "Top active items by priority and recent activity."
              : "Add active projects through the dashboard API."}
          </p>
        </div>
        <DashboardIconTile tone="mint">
          <FolderKanban className="h-5 w-5" />
        </DashboardIconTile>
      </div>

      {visible.length === 0 ? (
        <DashboardEmptyState title="No active projects yet">
          <p>
            Post a project to{" "}
            <code className="rounded bg-[var(--color-surface)] px-1 py-0.5 font-technical text-xs">
              POST /api/dashboard/projects
            </code>{" "}
            with statuses idea, validated, building, testing, shipped, or selling.
          </p>
        </DashboardEmptyState>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((project) => {
            const touched = formatTouched(project.last_touched_at);
            return (
              <article key={project.id} className={dashboardItemClassName}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                      Priority {project.priority}
                      {touched ? ` / Touched ${touched}` : ""}
                    </p>
                  </div>
                  <SignalBadge tone={statusTone(project.status)} className="self-start">
                    {project.status}
                  </SignalBadge>
                </div>

                {project.next_action ? (
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    <span className="font-semibold">Next:</span> {project.next_action}
                  </p>
                ) : null}

                {project.repo_url || project.live_url ? (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {project.live_url ? (
                      <Link
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[var(--color-signal-info)] hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Live
                      </Link>
                    ) : null}
                    {project.repo_url ? (
                      <Link
                        href={project.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-[var(--color-text-secondary)] hover:underline"
                      >
                        <Github className="h-3 w-3" /> Repo
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
