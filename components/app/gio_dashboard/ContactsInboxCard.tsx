import "server-only";

import ContactsInboxCardClient from "@/components/app/gio_dashboard/ContactsInboxCardClient";
import { getContactsForAdmin } from "@/lib/db/contactlist";

export default async function ContactsInboxCard() {
  try {
    const result = await getContactsForAdmin({ page: 1, pageSize: 20 });
    return <ContactsInboxCardClient contacts={result.data} totalCount={result.count} />;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load contacts";

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-red-200 dark:border-red-900/60">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contacts Inbox</h3>
        <p className="text-sm text-red-600 dark:text-red-300">{message}</p>
      </div>
    );
  }
}
