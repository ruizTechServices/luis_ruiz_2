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
    "Case-study style projects, software experiments, and proof-of-work from Luis Ruiz, founder-builder behind ruizTechServices.",
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
  const featuredProjects = projects.filter((project) => project.featured);

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
              Projects, case studies, and live systems that show how I actually build.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              This page should function like evidence, not decoration. The goal is to show what the work is, what problems it addresses, how it was built, and how it connects back to Luis Ruiz, ruizTechServices, and the broader founder-builder direction of the site.
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
                Read Blog / Build Log
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

      <section className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/70">Case study direction</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">The model is now built to hold more honest project depth.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Projects can now carry structured case-study fields like role, context, problem, constraints, architecture, key decisions, outcomes, repo links, status, and category. That fixes the core limitation that was keeping this page shallow.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/70">Featured work</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{featuredProjects.length > 0 ? `${featuredProjects.length} featured ${featuredProjects.length === 1 ? "project" : "projects"}` : "No featured projects yet"}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              The next honest move is to fill this structure in for the strongest two or three entries first, instead of pretending the whole catalog is equally mature.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/70">
              Live project index
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">Current public work</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-400">
            These entries come from the site&apos;s project system. The structure is now richer, but the strongest value will come from actually converting the top entries into real case studies instead of generic cards.
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/70">Connected public execution</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Projects should connect to the Blog / Build Log.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                This page shows the work itself. The Blog / Build Log should show movement, iteration, technical choices, and what changed over time. Together, they build trust faster than either page alone.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Open Blog / Build Log
            </Link>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-6">
            {projects.map((project) => (
              <Project key={project.id} {...project} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
            No projects are published yet. That is fixable, and the next practical move is to seed the strongest entries with real case-study content.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-950/40 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-200/70">Next content layer</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Fill the strongest projects with honest detail, then let the build log support them.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            The schema and rendering can finally support that. The next valuable step is content work: pick the strongest 2 to 3 projects, write the case-study fields properly, and link each one to public updates where possible.
          </p>
        </div>
      </section>
    </main>
  );
}
