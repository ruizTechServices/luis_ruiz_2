// components/app/landing_page/about.tsx
import Image from 'next/image';
import SkillGlobe from './SkillGlobe';

export default function About() {
  return (
    <section
      className="relative overflow-hidden border-y border-[var(--color-border)] bg-[var(--color-canvas)] py-[var(--space-section)] text-[var(--color-text-primary)]"
      aria-labelledby="about-gio-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[var(--color-border-strong)] opacity-60"
        aria-hidden="true"
      />

      <div className="ss-container relative">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,1.08fr)] lg:items-stretch">
          <div className="ss-panel-raised flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 min-[420px]:flex-row min-[420px]:items-center">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-[var(--shadow-level-1)]">
                <Image
                  src="/edited/luis-2.png"
                  alt="Portrait of Gio"
                  width={80}
                  height={80}
                  className="size-20 object-cover"
                  priority={false}
                />
              </div>

              <div className="min-w-0">
                <h2
                  id="about-gio-heading"
                  className="font-display text-3xl font-extrabold leading-tight tracking-normal text-[var(--color-text-primary)] sm:text-4xl"
                >
                  Gio
                </h2>
                <p className="mt-1 text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
                  (Luis Giovanni Ruiz)
                </p>
              </div>
            </div>

            <p className="max-w-[var(--container-reading)] text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              I&apos;m a Bronx-born, bilingual full-stack AI engineer and founder
              of RuizTechServices LLC (est. 2024). My flagship product 24Hour-AI
              is a high-performance LLM platform achieving sub-200ms latency,
              99.9% uptime, and 30% cost optimization while supporting 100+
              concurrent users. I specialize in scalable AI infrastructure and
              enterprise-grade solutions that deliver measurable business value.
            </p>

            <blockquote className="border-l-4 border-[var(--color-action-primary)] bg-[var(--color-surface)] py-4 pl-5 pr-4 text-lg font-semibold leading-8 text-[var(--color-text-primary)] sm:text-xl">
              &quot;Learn &rarr; Build &rarr; Ship &rarr; Iterate.&quot;
            </blockquote>
          </div>

          <div className="ss-panel flex min-h-[30rem] flex-col overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="space-y-3">
              <p className="ss-eyebrow text-[var(--color-signal-mint)]">
                World-renowned skills
              </p>
              <h3 className="font-display max-w-2xl text-2xl font-bold leading-tight tracking-normal text-[var(--color-text-primary)] sm:text-3xl">
                The languages &amp; frameworks the world runs on &mdash; in orbit.
              </h3>
            </div>

            <div className="relative mt-8 min-h-[20rem] flex-1 overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] sm:min-h-[24rem] lg:min-h-0">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--color-signal-info),transparent_84%),transparent_58%)]"
                aria-hidden="true"
              />
              <SkillGlobe />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
