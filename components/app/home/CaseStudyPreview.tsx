import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudyRows } from "./home-data";

export function CaseStudyPreview() {
  return (
    <section className="bg-white py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] dark:border-white/10">
          <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(20,184,166,0.22),rgba(2,6,23,0.28))] p-7 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">
                Case-study preview
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                A clearer public hub for services, proof, and contact.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                This preview uses honest, current-state language: no invented
                metrics, no unsupported performance claims, and no internal
                operational details.
              </p>
              <Link
                href="/projects"
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
              >
                Open project surface
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-white/10">
              {caseStudyRows.map((row) => (
                <article key={row.label} className="grid gap-3 p-6 sm:grid-cols-[11rem_1fr] sm:p-7">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-100">
                    {row.label}
                  </h3>
                  <p className="text-sm leading-7 text-slate-300">{row.value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
