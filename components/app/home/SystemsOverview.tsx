import { systems } from "./home-data";

export function SystemsOverview() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] py-[var(--space-section)]">
      <div className="ss-container">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="ss-eyebrow">Operating systems</p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-[var(--color-text-primary)]">
              The public version of how the work is organized.
            </h2>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
              The site is becoming a practical hub: public proof in front,
              private operations behind it, and clear routes for services,
              products, experiments, and writing.
            </p>
          </div>

          <div className="grid gap-3">
            {systems.map((system, index) => (
              <article
                key={system.title}
                className="ss-muted-panel relative overflow-hidden p-5 transition hover:border-[var(--color-action-primary)]"
              >
                <p className="font-technical text-[0.65rem] font-medium uppercase tracking-[0.08em] text-[var(--color-action-primary)]">
                  SYS / 0{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  {system.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {system.description}
                </p>
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--color-action-primary)] opacity-80" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
