import { Activity, Building2, FileText, Gauge, Waypoints } from "lucide-react";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import { publicStatusItems } from "./home-data";

const icons = [Building2, Gauge, Waypoints, Activity, FileText];

export function PublicStatusPanel() {
  return (
    <section className="border-b border-[var(--color-border)] bg-[var(--color-canvas)] py-[var(--space-section)]">
      <div className="ss-container">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="ss-eyebrow">Public focus areas</p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-[var(--color-text-primary)]">
              What this hub is organizing right now.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
            This panel shows public-facing direction only: service areas,
            products, experiments, and writing.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {publicStatusItems.map((item, index) => {
            const Icon = icons[index] ?? Activity;

            return (
              <article
                key={item.title}
                className="ss-panel p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2 text-[var(--color-text-primary)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <SignalBadge tone={index === 2 ? "violet" : "mint"}>{item.status}</SignalBadge>
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
