import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import { featuredProjects } from "./home-data";

export function FeaturedProjects() {
  return (
    <section className="bg-[var(--color-canvas)] py-[var(--space-section)]">
      <div className="ss-container">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="ss-eyebrow">Selected work</p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-[var(--color-text-primary)]">
              Working systems with inspectable decisions.
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
              These cards stay high-level and link into existing public routes
              instead of adding new database requirements to the homepage.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-canvas)]"
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
              className="ss-panel group p-6 transition hover:border-[var(--color-action-primary)] hover:shadow-[var(--shadow-level-1)]"
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <SignalBadge tone={project.meta.toLowerCase().includes("ai") ? "violet" : "mint"}>
                  {project.meta}
                </SignalBadge>
                <ArrowUpRight className="h-4 w-4 text-[var(--color-text-subtle)] transition group-hover:text-[var(--color-action-primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {project.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
