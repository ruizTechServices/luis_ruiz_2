import Link from "next/link";
import { BlogCard } from "@/components/app/blog/blog_card";
import {
  DashboardCard,
  dashboardActionClassName,
} from "@/components/design-system/DashboardPrimitives";
import { contentActions } from "./dashboard-seed-data";

export async function ContentQueueCard() {
  return (
    <DashboardCard>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Content Queue</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Current build-log surface plus admin routes for content movement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {contentActions.map((action) => {
            const Icon = action.icon;

            return action.external ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className={dashboardActionClassName}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </a>
            ) : (
              <Link key={action.label} href={action.href} className={dashboardActionClassName}>
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-5">
        <BlogCard />
      </div>
    </DashboardCard>
  );
}
