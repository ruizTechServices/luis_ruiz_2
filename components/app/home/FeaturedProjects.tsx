import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { featuredProjects } from "./home-data";

export function FeaturedProjects() {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
              Featured public work
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Proof-of-work paths visitors can inspect.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              These cards stay high-level and link into existing public routes
              instead of adding new database requirements to the homepage.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            View all projects
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-200/40"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="rounded-md bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-300/10 dark:text-amber-200">
                  {project.meta}
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-teal-700 dark:group-hover:text-teal-200" />
              </div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                {project.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
