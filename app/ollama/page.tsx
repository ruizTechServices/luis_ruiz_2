import type { Metadata } from "next";
import Link from "next/link";
import { BeakerIcon, CpuChipIcon, MusicalNoteIcon, SparklesIcon } from "@heroicons/react/24/outline";
import Soundboard from "@/components/app/landing_page/soundboard";
import OllamaChatPage from "./OllamaChatClient";

export const metadata: Metadata = {
  title: "Experiments | Luis Ruiz",
  description:
    "Public experiments, interface tests, local AI work, and playful software builds from Luis Ruiz.",
};

const experimentNotes = [
  {
    title: "Public experiments, not filler",
    description:
      "This page is for real exploratory work, interaction ideas, local AI testing, and builds that show range even when they are not client-facing products.",
    icon: BeakerIcon,
  },
  {
    title: "Technical play still counts",
    description:
      "Some experiments sharpen product instincts, some stress-test interfaces, and some are just worth shipping because they prove speed, curiosity, and taste.",
    icon: SparklesIcon,
  },
  {
    title: "Local-first AI belongs here",
    description:
      "The Ollama surface stays in experiments because it reflects active system exploration, not polished portfolio positioning.",
    icon: CpuChipIcon,
  },
];

export default function ExperimentsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm font-medium text-violet-200">
              <BeakerIcon className="h-4 w-4" />
              Experiments / Lab
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Interfaces, local AI, and side experiments worth keeping public.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Not everything belongs in the main proof-of-work flow. This page is for the more exploratory side of the site, experiments that still show how I think, build, and test ideas in public.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                See Projects
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Read Blog / Build Log
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {experimentNotes.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
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

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        <div className="mb-6 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            <MusicalNoteIcon className="h-4 w-4" />
            Public experiment
          </div>
          <h2 className="text-3xl font-bold text-white">Soundboard</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This stays public because it is part of the experimentation layer, interactive, playful, fast to use, and very clearly one of your experiments.
          </p>
        </div>

        <Soundboard />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="mb-6 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            <CpuChipIcon className="h-4 w-4" />
            Local AI experiment
          </div>
          <h2 className="text-3xl font-bold text-white">Ollama Lab</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Local model routing and chat testing still belong here. Useful, real, but not part of the main trust path for clients landing on the site.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-2 sm:p-4">
          <OllamaChatPage />
        </div>
      </section>
    </main>
  );
}
