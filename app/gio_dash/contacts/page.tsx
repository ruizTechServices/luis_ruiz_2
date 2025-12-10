// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\contacts\page.tsx
import "server-only";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { getContactsForAdmin } from "@/lib/db/contactlist";
import ContactsClient from "./ContactsClient";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const supabase = await createServerClient();

  // Auth check: admin only
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;
  if (!email) {
    redirect("/login");
  }
  if (!isOwner(email)) {
    redirect("/dashboard");
  }

  // Parse pagination
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  // Fetch contacts
  let contacts;
  let error: string | null = null;
  try {
    contacts = await getContactsForAdmin({ page, pageSize: 20 });
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch contacts";
    contacts = { data: [], count: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Contact List
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage leads and contact form submissions ({contacts.count} total)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <ContactsClient
          contacts={contacts.data}
          page={contacts.page}
          totalPages={contacts.totalPages}
          count={contacts.count}
        />
      </div>
    </div>
  );
}
