import Link from "next/link";
import { ArrowRight, FolderKanban, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const heroLinks = [
  {
    label: "View Services",
    href: "/contact",
    icon: Sparkles,
    variant: "primary" as const,
  },
  {
    label: "See Projects",
    href: "/projects",
    icon: FolderKanban,
    variant: "secondary" as const,
  },
  {
    label: "Contact Gio",
    href: "/contact",
    icon: Mail,
    variant: "secondary" as const,
  },
];

const signals = [
  "Dashboards",
  "Automations",
  "AI assistants",
  "Websites",
  "Internal tools",
];

export function MasterHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_48%,#eef8f6_100%)] text-slate-950 dark:border-white/10 dark:bg-[linear-gradient(135deg,#020617_0%,#111827_48%,#062f2f_100%)] dark:text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent dark:via-teal-300/55" />
      <div className="pointer-events-none absolute left-1/2 top-12 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-teal-200/25 blur-3xl dark:bg-sky-400/15" />

      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-7xl items-center gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div>
          <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
            Luis Ruiz builds practical AI, web, and automation systems for small
            businesses, creators, and operators.
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg dark:text-slate-300">
            Through ruizTechServices, Luis turns messy workflows into clean
            digital systems: dashboards, automations, AI assistants, websites,
            and internal tools.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {heroLinks.map((link) => {
              const Icon = link.icon;
              const className =
                link.variant === "primary"
                  ? "h-11 rounded-md bg-slate-950 px-5 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  : "h-11 rounded-md border border-slate-300 bg-white px-5 text-slate-900 hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

              return (
                <Button key={link.label} asChild variant="ghost" className={className}>
                  <Link href={link.href}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-slate-200 bg-white/88 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-[0_24px_70px_rgba(0,0,0,0.32)]">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
                  Public master hub
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">
                  ruizTechServices operating surface
                </h2>
              </div>
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                Public-safe
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {signals.map((signal) => (
                <div
                  key={signal}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-slate-950/35"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {signal}
                  </span>
                  <span className="h-2 w-16 rounded-full bg-gradient-to-r from-teal-300 via-sky-400 to-amber-400" />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                A public entry point for services, proof-of-work, build notes,
                and practical system design.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
