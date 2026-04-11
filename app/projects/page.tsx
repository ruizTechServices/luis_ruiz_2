import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowTopRightOnSquareIcon,
  BriefcaseIcon,
  ClockIcon,
  CpuChipIcon,
  PencilSquareIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import Project from "@/components/app/projects/project";
import { getProjects } from "@/lib/db/projects";

export const metadata: Metadata = {
  title: "Projects | Luis Ruiz",
  description:
    "Projects, software experiments, and proof-of-work from Luis Ruiz, founder-builder behind ruizTechServices.",
};

const proofPoints = [
  {
    title: "Built systems, not mock portfolio pieces",
    description:
      "This page is meant to show real technical work, public experiments, and live software directions, not decorative filler.",
    icon: RocketLaunchIcon,
  },
  {
    title: "Connected to business direction",
    description:
      "The strongest projects here support ruizTechServices, future products, or the broader founder-builder path behind the site.",
    icon: BriefcaseIcon,
  },
  {
    title: "Still in motion",
    description:
      "Some work is polished, some is still evolving. That is intentional. The value is in visible execution, iteration, and proof.",
    icon: ClockIcon,
  },
];

const projectFilters = ["AI systems", "Web products", "Public build work", "Client-adjacent execution"];

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
              <CpuChipIcon className="h-4 w-4" />
              Proof of work, not portfolio theater
            </div>

            <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Projects, experiments, and live systems that show how I actually build.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              This is the stronger second layer behind the homepage. Instead of a generic project grid, this page is meant to show visible execution, product thinking, and the technical direction behind Luis Ruiz and ruizTechServices.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {projectFilters.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                <PencilSquareIcon className="h-4 w-4" />
                Read Build Log
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                Start a Conversation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {proofPoints.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 inline-flex rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-violet-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/70">
              Live project index
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Current public work</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            These entries come from the site&apos;s project system. Right now the model is still lightweight, but the page framing is being upgraded so visitors understand what the work means, not just where to click.
          </p>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-6">
            {projects.map((project) => (
              <Project
                key={project.id}
                url={project.url}
                title={project.title ?? undefined}
                description={project.description ?? undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
            No projects are published yet. That is fixable, and the content model should be expanded next so this page can support stronger case-study style entries.
          </div>
        )}
      </section>
    </main>
  );
}
