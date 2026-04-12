import "server-only";
import ContactsClient from "./ContactsClient";
import { getContactsForAdmin } from "@/lib/db/contactlist";

interface ContactsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = await searchParams;
  const page = Number.parseInt(params.page ?? "1", 10);

  let contacts;
  let error: string | null = null;

  try {
    contacts = await getContactsForAdmin({ page: Number.isNaN(page) ? 1 : page, pageSize: 20 });
  } catch (cause) {
    error = cause instanceof Error ? cause.message : "Failed to fetch contacts";
    contacts = { data: [], count: 0, page: 1, pageSize: 20, totalPages: 0 };
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.12),_transparent_24%),linear-gradient(145deg,_#f8fafc_0%,_#eef2ff_50%,_#e0f2fe_100%)] px-6 py-8 dark:bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.10),_transparent_22%),linear-gradient(145deg,_#020617_0%,_#0f172a_50%,_#172554_100%)]">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[2rem] border border-white/20 bg-white/[0.7] p-8 shadow-[0_28px_75px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-[0_28px_75px_rgba(2,6,23,0.28)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700/80 dark:text-sky-200/80">
            Admin intake
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Contact leads
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Review the incoming lead queue inside the app, inspect full submissions, and keep contact intake separate from the public contact form implementation.
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

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
