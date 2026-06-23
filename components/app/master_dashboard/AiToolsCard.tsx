import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import {
  DashboardCard,
  DashboardIconTile,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import { aiTools } from "./dashboard-seed-data";

export function AiToolsCard() {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">AI Tools</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Routes into the local model lab and multi-model discussion tool.
          </p>
        </div>
        <DashboardIconTile tone="violet">
          <Bot className="h-5 w-5" />
        </DashboardIconTile>
      </div>

      <div className="mt-5 space-y-3">
        {aiTools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className={`${dashboardItemClassName} block transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{tool.name}</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{tool.description}</p>
              </div>
              <SignalBadge tone="violet">{tool.status}</SignalBadge>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-signal-violet)]">
              Open tool
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </DashboardCard>
  );
}
