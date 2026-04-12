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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.12),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#0f172a_42%,_#111827_100%)] text-white">
      <section className="border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24 lg:px-8">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200/20 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 shadow-[0_12px_35px_rgba(15,23,42,0.2)] backdrop-blur-xl">
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
                className="inline-flex items-center gap-2 rounded-full border border-sky-100/20 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_14px_32px_rgba(148,163,184,0.18)] transition hover:bg-white"
              >
                See Projects
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/[0.12]"
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
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                <div className="mb-4 inline-flex rounded-xl border border-sky-200/20 bg-white/10 p-3 text-sky-100 backdrop-blur-lg">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-4xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200/15 bg-sky-200/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100 backdrop-blur-md">
            <CpuChipIcon className="h-4 w-4" />
            Local AI experiment
          </div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ollama Lab</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            The goal here is simple, make local AI testing feel clean, capable, and product-like. The chat should be the focus, with supporting context that helps without crowding it.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_290px] xl:items-start">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.72))] p-2 shadow-[0_30px_90px_rgba(2,6,23,0.45)] ring-1 ring-white/5 backdrop-blur-2xl sm:p-4">
            <OllamaChatPage />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/75">What this is</p>
              <h3 className="mt-2 text-lg font-semibold text-white">A focused local model workspace.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                This is for real local prompting, streaming checks, and retrieval experiments. It should feel reliable and calm, not like a stack of random demo boxes.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/75">Quick guidance</p>
              <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                <li>Start with a simple prompt to confirm streaming.</li>
                <li>Adjust temperature and top-p only when behavior actually needs tuning.</li>
                <li>Use retrieval only when you want context involved.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="mb-6 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-100 backdrop-blur-md">
            <MusicalNoteIcon className="h-4 w-4" />
            Public experiment
          </div>
          <h2 className="text-3xl font-bold text-white">Soundboard</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            This stays exactly what it is, a playful interactive experiment. It just no longer competes with the Ollama chat surface for top billing on the page.
          </p>
        </div>

        <Soundboard />
      </section>
    </main>
  );
}
