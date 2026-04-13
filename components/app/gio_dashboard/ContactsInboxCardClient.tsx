"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ContactRecord } from "@/lib/types/contact";

type ContactsInboxCardClientProps = {
  contacts: ContactRecord[];
  totalCount: number;
};

function filterContacts(records: ContactRecord[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return records;

  return records.filter((record) =>
    [record.full_name, record.email, record.company, record.subject, record.message]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized))
  );
}

export default function ContactsInboxCardClient({ contacts, totalCount }: ContactsInboxCardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(contacts[0]?.id ?? null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = useMemo(() => filterContacts(contacts, query), [contacts, query]);
  const selected = useMemo(
    () => filtered.find((contact) => contact.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  async function handleDelete(id: number) {
    if (!confirm("Delete this contact from the inbox?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Delete failed");
      }
      startTransition(() => router.refresh());
    } catch (error) {
      alert(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contacts Inbox</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Review recent contact leads directly from Gio Dashboard ({totalCount} total)
        </p>
      </div>

      <div className="mb-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, company, subject, message"
          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(260px,0.9fr)] xl:h-[430px]">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden xl:h-[430px]">
          <div className="h-[320px] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 xl:h-[430px]">
            {filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No contacts match this search.
              </div>
            ) : (
              filtered.slice(0, 12).map((contact) => {
                const isSelected = selected?.id === contact.id;
                const displayName = contact.full_name || "Unnamed contact";
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedId(contact.id)}
                    className={`w-full px-4 py-3 text-left transition ${
                      isSelected ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-gray-50 dark:hover:bg-gray-900/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{contact.email || "No email"}</p>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">{contact.subject || "general"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/80 dark:bg-gray-900/40 h-[320px] overflow-y-auto xl:h-[430px]">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Selected lead</p>
                  <h4 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{selected.full_name || "Unnamed contact"}</h4>
                </div>
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deletingId === selected.id || isPending}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-300"
                >
                  {deletingId === selected.id ? "Deleting..." : "Delete"}
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-medium text-gray-900 dark:text-white">Email:</span> {selected.email || "No email"}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Phone:</span> {selected.phone || "No phone"}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Company:</span> {selected.company || "No company"}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Budget:</span> {selected.budget || "Not specified"}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Timeline:</span> {selected.timeline || "Not specified"}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Preferred contact:</span> {selected.preferred_contact || "Not specified"}</p>
                <p><span className="font-medium text-gray-900 dark:text-white">Newsletter:</span> {selected.newsletter ? "Yes" : "No"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {selected.message || "No message body"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
              Select a contact to inspect the inbox entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
