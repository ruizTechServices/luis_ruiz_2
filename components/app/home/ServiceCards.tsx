import Link from "next/link";
import {
  Bot,
  Building,
  ChartNoAxesCombined,
  Cpu,
  MonitorCog,
  Wrench,
} from "lucide-react";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import { services } from "./home-data";

const icons = [MonitorCog, Bot, Cpu, ChartNoAxesCombined, Wrench, Building];

export function ServiceCards() {
  return (
    <section className="bg-[var(--color-canvas)] py-[var(--space-section)]">
      <div className="ss-container">
        <div className="max-w-3xl">
          <p className="ss-eyebrow">Services</p>
          <h2 className="mt-2 text-3xl font-bold tracking-normal text-[var(--color-text-primary)]">
            Business outcomes, not technology theater.
          </h2>
          <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
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
                className="ss-panel group p-6 transition duration-[var(--motion-fast)] hover:border-[var(--color-action-primary)] hover:shadow-[var(--shadow-level-1)]"
              >
                <div className="mb-5 flex size-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)] text-[var(--color-text-primary)] transition group-hover:border-[var(--color-action-primary)]">
                  <Icon className="h-5 w-5" />
                </div>
                <SignalBadge tone={index === 1 ? "violet" : index === 2 ? "mint" : "orange"}>
                  {index === 1 ? "Practical AI" : index === 2 ? "Operations" : "Systems"}
                </SignalBadge>
                <h3 className="mt-4 text-lg font-semibold text-[var(--color-text-primary)]">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {service.description}
                </p>
                <p className="mt-5 text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-action-primary)]">
                  See capabilities
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
