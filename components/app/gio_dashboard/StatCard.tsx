import * as React from "react";
import {
  DashboardCard,
  DashboardIconTile,
} from "@/components/design-system/DashboardPrimitives";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgClassName?: string;
  className?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  className = "",
}: StatCardProps) {
  return (
    <DashboardCard className={className}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-text-subtle)]">{title}</p>
          <p className="text-3xl font-bold text-[var(--color-text-primary)]">{value}</p>
        </div>
        <DashboardIconTile tone="info">{icon}</DashboardIconTile>
      </div>
    </DashboardCard>
  );
}
