import Link from "next/link";
import { ArrowUpRight, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard, DashboardIconTile } from "@/components/design-system/DashboardPrimitives";

export function ClientSupportCard() {
  return (
    <DashboardCard>
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <DashboardIconTile>
            <LifeBuoy className="h-5 w-5" />
          </DashboardIconTile>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Support / Contact Gio</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Need help now? Use the contact form and include the email tied to this dashboard.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/contact">
            Contact Gio
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </DashboardCard>
  );
}
