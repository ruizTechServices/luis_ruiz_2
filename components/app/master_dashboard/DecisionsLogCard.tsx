import { decisions } from "./dashboard-seed-data";

export function DecisionsLogCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div>
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Decisions Log</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Static shell entries until the decisions table is connected.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {decisions.map((decision) => (
          <article key={decision.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{decision.title}</h3>
              <span className="self-start rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
                {decision.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{decision.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
