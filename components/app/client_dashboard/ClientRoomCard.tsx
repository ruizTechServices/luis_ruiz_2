import type { LucideIcon } from "lucide-react";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardIconTile,
} from "@/components/design-system/DashboardPrimitives";

type ClientRoomCardProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: LucideIcon;
  tone?: "default" | "mint" | "violet" | "warning" | "info" | "danger";
};

export function ClientRoomCard({
  title,
  description,
  emptyTitle,
  emptyDescription,
  icon: Icon,
  tone = "info",
}: ClientRoomCardProps) {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
        </div>
        <DashboardIconTile tone={tone}>
          <Icon className="h-5 w-5" />
        </DashboardIconTile>
      </div>

      <DashboardEmptyState title={emptyTitle}>
        <p>{emptyDescription}</p>
      </DashboardEmptyState>
    </DashboardCard>
  );
}
