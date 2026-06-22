import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudyRows } from "./home-data";

export function CaseStudyPreview() {
  return (
    <section className="bg-[var(--color-surface)] py-[var(--space-section)]">
      <div className="ss-container">
        <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-text-primary)] text-[var(--color-canvas)] shadow-[var(--shadow-level-2)]">
          <div className="grid gap-0 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="border-b border-[color-mix(in_srgb,var(--color-canvas),transparent_78%)] p-7 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="font-technical text-[0.65rem] font-medium uppercase tracking-[0.08em] text-[var(--color-action-primary)]">
                Case-study preview
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-normal">
                A clearer public hub for services, proof, and contact.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[color-mix(in_srgb,var(--color-canvas),transparent_22%)]">
                This preview uses honest, current-state language: no invented
                metrics, no unsupported performance claims, and no internal
                operational details.
              </p>
              <Link
                href="/projects"
                className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--color-action-primary)] px-5 text-sm font-semibold text-[var(--color-action-on-primary)] transition hover:bg-[var(--color-action-primary-hover)]"
              >
                Open project surface
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-[color-mix(in_srgb,var(--color-canvas),transparent_82%)]">
              {caseStudyRows.map((row) => (
                <article key={row.label} className="grid gap-3 p-6 sm:grid-cols-[11rem_1fr] sm:p-7">
                  <h3 className="font-technical text-[0.65rem] font-medium uppercase tracking-[0.08em] text-[var(--color-action-primary)]">
                    {row.label}
                  </h3>
                  <p className="text-sm leading-7 text-[color-mix(in_srgb,var(--color-canvas),transparent_22%)]">
                    {row.value}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
