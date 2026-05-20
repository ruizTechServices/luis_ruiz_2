import Link from "next/link";
import { ExternalLink, FolderKanban, Github } from "lucide-react";
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

function statusToneClasses(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "shipped" || normalized === "selling") {
    return "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200";
  }
  if (normalized === "building" || normalized === "testing") {
    return "bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200";
  }
  if (normalized === "validated") {
    return "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200";
  }
  if (normalized === "idea") {
    return "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200";
  }
  return "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200";
}

export type ActiveProjectsCardProps = {
  projects: DashboardProject[];
};

export function ActiveProjectsCard({ projects }: ActiveProjectsCardProps) {
  const visible = projects.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Active Projects</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {visible.length > 0
              ? "Top active items by priority and recent activity."
              : "Add active projects through the dashboard API."}
          </p>
        </div>
        <span className="rounded-md bg-teal-50 p-2 text-teal-800 dark:bg-teal-300/10 dark:text-teal-200">
          <FolderKanban className="h-5 w-5" />
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/[0.04]">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No active projects yet
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Post a project to <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">POST /api/dashboard/projects</code>
            {" "}with statuses idea, validated, building, testing, shipped, or selling.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((project) => {
            const touched = formatTouched(project.last_touched_at);
            return (
              <article
                key={project.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Priority {project.priority}
                      {touched ? ` · Touched ${touched}` : ""}
                    </p>
                  </div>
                  <span
                    className={`self-start rounded-md px-2 py-1 text-xs font-semibold ${statusToneClasses(project.status)}`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.next_action ? (
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                    <span className="font-semibold">Next:</span> {project.next_action}
                  </p>
                ) : null}

                {(project.repo_url || project.live_url) ? (
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {project.live_url ? (
                      <Link
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline dark:text-sky-300"
                      >
                        <ExternalLink className="h-3 w-3" /> Live
                      </Link>
                    ) : null}
                    {project.repo_url ? (
                      <Link
                        href={project.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:underline dark:text-slate-200"
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
    </section>
  );
}
