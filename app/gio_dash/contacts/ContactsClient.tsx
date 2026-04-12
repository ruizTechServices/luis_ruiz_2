"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContactRecord } from "@/lib/types/contact";
import { filterContacts } from "@/lib/db/contactlist";

type ContactsClientProps = {
  contacts: ContactRecord[];
  page: number;
  totalPages: number;
  count: number;
};

const subjectOptions = ["all", "general", "quote", "support", "partnership", "billing", "other"] as const;
const newsletterOptions = [
  { value: "all", label: "All leads" },
  { value: "subscribed", label: "Newsletter yes" },
  { value: "unsubscribed", label: "Newsletter no" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ContactsClient({ contacts, page, totalPages, count }: ContactsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>("all");
  const [newsletter, setNewsletter] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [selectedId, setSelectedId] = useState<number | null>(contacts[0]?.id ?? null);

  const filteredContacts = useMemo(
    () => filterContacts(contacts, { query, subject, newsletter }),
    [contacts, newsletter, query, subject]
  );

  const selectedContact = useMemo(
    () => filteredContacts.find((contact) => contact.id === selectedId) ?? filteredContacts[0] ?? null,
    [filteredContacts, selectedId]
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact from the admin queue?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Delete failed");
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (nextPage: number) => {
    startTransition(() => {
      router.push(`/gio_dash/contacts?page=${nextPage}`);
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_180px_200px]">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Search leads
          </label>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, email, company, subject, or message"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Subject
          </label>
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {subjectOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All subjects" : option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Newsletter
          </label>
          <select
            value={newsletter}
            onChange={(event) => setNewsletter(event.target.value as "all" | "subscribed" | "unsubscribed")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-300 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            {newsletterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.8fr)]">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.08] shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Lead queue</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {filteredContacts.length} visible on this page, {count} total saved contacts
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[720px] overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No contacts match the current filters.
              </div>
            ) : (
              <div className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContact?.id === contact.id;
                  const displayName =
                    contact.full_name || `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "Unnamed contact";

                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => setSelectedId(contact.id)}
                      className={`w-full px-5 py-4 text-left transition ${
                        isSelected
                          ? "bg-sky-100/70 dark:bg-sky-950/40"
                          : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
                            {contact.newsletter ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                Newsletter
                              </span>
                            ) : null}
                          </div>
                          <p className="truncate text-sm text-slate-600 dark:text-slate-300">{contact.email ?? "No email"}</p>
                          <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                            {contact.message ?? "No message body"}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                            {contact.subject ?? "general"}
                          </p>
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatDate(contact.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
          {selectedContact ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Selected lead</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                    {selectedContact.full_name || `${selectedContact.first_name ?? ""} ${selectedContact.last_name ?? ""}`.trim() || "Unnamed contact"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Received {formatDate(selectedContact.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  disabled={deletingId === selectedContact.id}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/30"
                >
                  {deletingId === selectedContact.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Email</p>
                  <a href={`mailto:${selectedContact.email ?? ""}`} className="mt-2 block text-sm text-sky-700 hover:underline dark:text-sky-300">
                    {selectedContact.email ?? "No email provided"}
                  </a>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Phone</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedContact.phone || "No phone provided"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Company</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedContact.company || "No company listed"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Subject</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedContact.subject || "General"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Budget</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedContact.budget || "Not specified"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Timeline</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedContact.timeline || "Not specified"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Preferred contact</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedContact.preferred_contact || "Not specified"}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Newsletter</p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{selectedContact.newsletter ? "Subscribed" : "No"}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Message</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {selectedContact.message || "No message body"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
              Select a contact to inspect the full lead details.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || isPending}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || isPending}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
