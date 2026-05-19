import { systems } from "./home-data";

export function SystemsOverview() {
  return (
    <section className="border-y border-slate-200/70 bg-white py-16 dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
              Operating systems
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              The public version of how the work is organized.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              The site is becoming a practical hub: public proof in front,
              private operations behind it, and clear routes for services,
              products, experiments, and writing.
            </p>
          </div>

          <div className="grid gap-3">
            {systems.map((system, index) => (
              <article
                key={system.title}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[auto_1fr] dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                    {system.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {system.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
