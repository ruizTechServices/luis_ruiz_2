import Link from "next/link";
import {
  Bot,
  Building,
  ChartNoAxesCombined,
  Cpu,
  MonitorCog,
  Wrench,
} from "lucide-react";
import { services } from "./home-data";

const icons = [MonitorCog, Bot, Cpu, ChartNoAxesCombined, Wrench, Building];

export function ServiceCards() {
  return (
    <section className="bg-slate-50 py-16 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
            Services
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Practical builds for people who need the system to work.
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
            ruizTechServices focuses on useful software, clear implementation,
            and technical support that helps operators move work forward.
          </p>
        </div>

        <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = icons[index] ?? MonitorCog;

            return (
              <Link
                key={service.title}
                href="/contact"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-200/40"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white transition group-hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:group-hover:bg-teal-200">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {service.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-teal-700 dark:text-teal-200">
                  Start with Gio
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
