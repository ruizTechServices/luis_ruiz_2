"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardStatusBadge,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import { cn } from "@/lib/utils";
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
      .some((value) => String(value).toLowerCase().includes(normalized)),
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
    [filtered, selectedId],
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
    <DashboardCard>
      <div className="mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">Contacts Inbox</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Review recent contact leads directly from Gio Dashboard.
            </p>
          </div>
          <DashboardStatusBadge>{totalCount} total</DashboardStatusBadge>
        </div>
      </div>

      <div className="mb-4">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, email, company, subject, message"
          autoComplete="off"
          className="min-h-11"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(260px,0.9fr)]">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
          <div className="max-h-[430px] overflow-y-auto divide-y divide-[var(--color-border)]">
            {filtered.length === 0 ? (
              <DashboardEmptyState title="No contacts match this search">
                Adjust the query or clear the search field.
              </DashboardEmptyState>
            ) : (
              filtered.slice(0, 12).map((contact) => {
                const isSelected = selected?.id === contact.id;
                const displayName = contact.full_name || "Unnamed contact";
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setSelectedId(contact.id)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]",
                      isSelected ? "bg-[var(--color-surface-raised)]" : "hover:bg-[var(--color-surface-raised)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">{displayName}</p>
                        <p className="truncate text-xs text-[var(--color-text-subtle)]">{contact.email || "No email"}</p>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">{contact.subject || "general"}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={`${dashboardItemClassName} max-h-[430px] overflow-y-auto`}>
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">Selected lead</p>
                  <h4 className="mt-1 text-lg font-semibold text-[var(--color-text-primary)]">{selected.full_name || "Unnamed contact"}</h4>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(selected.id)}
                  disabled={deletingId === selected.id || isPending}
                  className="text-[var(--color-signal-danger)] hover:text-[var(--color-signal-danger)]"
                >
                  {deletingId === selected.id ? "Deleting..." : "Delete"}
                </Button>
              </div>

              <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <p><span className="font-medium text-[var(--color-text-primary)]">Email:</span> {selected.email || "No email"}</p>
                <p><span className="font-medium text-[var(--color-text-primary)]">Phone:</span> {selected.phone || "No phone"}</p>
                <p><span className="font-medium text-[var(--color-text-primary)]">Company:</span> {selected.company || "No company"}</p>
                <p><span className="font-medium text-[var(--color-text-primary)]">Budget:</span> {selected.budget || "Not specified"}</p>
                <p><span className="font-medium text-[var(--color-text-primary)]">Timeline:</span> {selected.timeline || "Not specified"}</p>
                <p><span className="font-medium text-[var(--color-text-primary)]">Preferred contact:</span> {selected.preferred_contact || "Not specified"}</p>
                <p><span className="font-medium text-[var(--color-text-primary)]">Newsletter:</span> {selected.newsletter ? "Yes" : "No"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text-secondary)]">
                  {selected.message || "No message body"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center text-center text-sm text-[var(--color-text-subtle)]">
              Select a contact to inspect the inbox entry.
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
