import Link from "next/link";
import { ArrowRight, Database, FolderKanban, Mail, Network, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import { StatusIndicator } from "@/components/design-system/StatusIndicator";

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
  { label: "Business need", tone: "orange" as const, copy: "Discovery and constraints" },
  { label: "Web system", tone: "neutral" as const, copy: "Applications and workflows" },
  { label: "Data layer", tone: "mint" as const, copy: "Auth, storage, operations" },
  { label: "Private AI", tone: "violet" as const, copy: "Grounded assistant paths" },
];

const signalBorder = {
  orange: "var(--color-action-primary)",
  neutral: "var(--color-border)",
  mint: "var(--color-signal-mint)",
  violet: "var(--color-signal-violet)",
};

export function MasterHero() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-canvas)] py-12 sm:py-16 lg:py-20">
      <div className="ss-container">
        <div className="mb-8 flex flex-col gap-3 font-technical text-[0.6rem] uppercase tracking-[0.08em] text-[var(--color-text-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <StatusIndicator tone="mint">Available for select projects</StatusIndicator>
          <span>New York / Remote</span>
        </div>

        <div className="ss-panel grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.78fr)] lg:p-12">
          <div className="flex flex-col items-start">
            <SignalBadge tone="orange">New York / Full-stack systems</SignalBadge>
            <h1 className="font-display mt-6 max-w-4xl text-4xl font-extrabold leading-[1.02] tracking-normal text-[var(--color-text-primary)] sm:text-5xl lg:text-6xl">
              Software systems for businesses ready to modernize.
          </h1>

            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              I am Luis Ruiz, a full-stack developer building web applications,
              internal tools, and practical AI infrastructure through
              ruizTechServices LLC.
          </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {heroLinks.map((link) => {
              const Icon = link.icon;

              return (
                  <Button
                    key={link.label}
                    asChild
                    variant={link.variant === "primary" ? "default" : "secondary"}
                  >
                  <Link href={link.href}>
                    <Icon className="h-4 w-4" />
                    {link.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
            </div>

            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-action-primary)]"
            >
              Inspect my approach <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="ss-muted-panel flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="ss-eyebrow text-[var(--color-signal-mint)]">System / Live</p>
              <Network className="size-5 text-[var(--color-text-subtle)]" aria-hidden="true" />
            </div>

            <div className="grid gap-3">
              {signals.map((signal, index) => (
                <div
                  key={signal.label}
                  className="rounded-xl border bg-[var(--color-surface)] p-4"
                  style={{ borderColor: signalBorder[signal.tone] }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-technical text-[0.58rem] uppercase tracking-[0.08em] text-[var(--color-text-subtle)]">
                      0{index + 1}
                    </p>
                    {index === 2 ? (
                      <Database className="size-4 text-[var(--color-signal-mint)]" aria-hidden="true" />
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">
                    {signal.label}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {signal.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
