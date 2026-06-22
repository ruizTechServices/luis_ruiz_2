import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Clock, Cpu } from "lucide-react";
import Project from "@/components/app/projects/project";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import { StatusIndicator } from "@/components/design-system/StatusIndicator";
import { getProjects } from "@/lib/db/projects";

export const metadata: Metadata = {
  title: "Projects | Luis Ruiz",
  description:
    "Case-study style projects, software experiments, and proof-of-work from Luis Ruiz, founder-builder behind ruizTechServices.",
};

const proofPoints = [
  {
    title: "Built systems, not portfolio theater",
    description:
      "Real project records, experiments, and live software directions are more useful than decorative mock pieces.",
    icon: BriefcaseBusiness,
    tone: "orange" as const,
  },
  {
    title: "Architecture stays inspectable",
    description:
      "Strong entries explain the problem, role, stack, tradeoffs, current state, and evidence.",
    icon: Cpu,
    tone: "mint" as const,
  },
  {
    title: "Some work is still in motion",
    description:
      "Active projects are labeled as active instead of being falsely presented as finished production systems.",
    icon: Clock,
    tone: "violet" as const,
  },
];

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <main className="min-h-screen bg-[var(--color-canvas)]">
      <section className="border-b border-[var(--color-border)] py-12 sm:py-16">
        <div className="ss-container">
          <div className="ss-panel p-6 sm:p-8 lg:p-11">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <SignalBadge tone="orange">Proof of work</SignalBadge>
                <h1 className="font-display mt-6 text-4xl font-extrabold leading-[1.05] tracking-normal text-[var(--color-text-primary)] sm:text-5xl">
                  Projects, case studies, and live systems that show how I actually build.
                </h1>
                <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)]">
                  This page is evidence, not decoration. The strongest project records explain what was built, why it mattered, how it works, and what state it is actually in.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/blog"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-canvas)]"
                >
                  <BookOpen className="size-4" />
                  Build Log
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-action-primary)] px-5 text-sm font-semibold text-[var(--color-action-on-primary)] transition hover:bg-[var(--color-action-primary-hover)]"
                >
                  Start a Conversation
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="ss-container grid gap-5 md:grid-cols-3">
          {proofPoints.map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} className="ss-panel p-6">
                <div className="mb-5 inline-flex size-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]">
                  <Icon className="size-5 text-[var(--color-text-primary)]" />
                </div>
                <SignalBadge tone={item.tone}>0{proofPoints.indexOf(item) + 1}</SignalBadge>
                <h2 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="pb-[var(--space-section)]">
        <div className="ss-container">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="ss-eyebrow">Current public work</p>
              <h2 className="mt-2 text-3xl font-bold tracking-normal text-[var(--color-text-primary)]">
                {featuredProjects.length > 0
                  ? `${featuredProjects.length} featured ${featuredProjects.length === 1 ? "project" : "projects"} and the wider project index`
                  : "Current public work"}
              </h2>
            </div>
            <StatusIndicator tone="mint">
              {projects.length} {projects.length === 1 ? "published record" : "published records"}
            </StatusIndicator>
          </div>

          {projects.length > 0 ? (
            <div className="grid gap-6">
              {projects.map((project) => (
                <Project key={project.id} {...project} />
              ))}
            </div>
          ) : (
            <div className="ss-panel border-dashed p-10 text-center text-[var(--color-text-secondary)]">
              No projects are published yet. The next practical move is to seed the strongest entries with real case-study content.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
