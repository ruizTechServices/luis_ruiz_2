import "server-only";

import {
  DashboardCard,
  DashboardErrorState,
} from "@/components/design-system/DashboardPrimitives";
import ContactsInboxCardClient from "@/components/app/gio_dashboard/ContactsInboxCardClient";
import { getContactsForAdmin } from "@/lib/db/contactlist";

export default async function ContactsInboxCard() {
  try {
    const result = await getContactsForAdmin({ page: 1, pageSize: 20 });
    return <ContactsInboxCardClient contacts={result.data} totalCount={result.count} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load contacts";

    return (
      <DashboardCard>
        <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">Contacts Inbox</h3>
        <DashboardErrorState>{message}</DashboardErrorState>
      </DashboardCard>
    );
  }
}
