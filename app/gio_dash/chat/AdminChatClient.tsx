"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardTableShell,
  dashboardTableBodyClassName,
  dashboardTableCellClassName,
  dashboardTableClassName,
  dashboardTableHeadClassName,
  dashboardTableStrongCellClassName,
} from "@/components/design-system/DashboardPrimitives";
import type { ChatSession } from "@/lib/db/chat";

interface AdminChatClientProps {
  sessions: ChatSession[];
}

export default function AdminChatClient({ sessions }: AdminChatClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (chatId: number) => {
    if (!confirm("Delete this chat session? This cannot be undone.")) return;

    setDeletingId(chatId);
    try {
      const res = await fetch(`/api/chat/sessions/${chatId}`, { method: "DELETE" });
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

  if (sessions.length === 0) {
    return (
      <DashboardEmptyState title="No chat sessions found">
        Chat sessions will appear here after visitors use the chat surface.
      </DashboardEmptyState>
    );
  }

  const userGroups = new Map<string, ChatSession[]>();
  sessions.forEach((session) => {
    const key = session.user_id ?? "anonymous";
    const arr = userGroups.get(key) ?? [];
    arr.push(session);
    userGroups.set(key, arr);
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <DashboardCard>
          <p className="text-sm text-[var(--color-text-subtle)]">Total Sessions</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{sessions.length}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-[var(--color-text-subtle)]">Unique Users</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">{userGroups.size}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-sm text-[var(--color-text-subtle)]">Total Messages</p>
          <p className="text-2xl font-bold text-[var(--color-text-primary)]">
            {sessions.reduce((acc, session) => acc + session.message_count, 0)}
          </p>
        </DashboardCard>
      </div>

      <DashboardTableShell>
        <table className={dashboardTableClassName}>
          <thead className={dashboardTableHeadClassName}>
            <tr>
              <th className="px-4 py-3">Session ID</th>
              <th className="px-4 py-3">User ID</th>
              <th className="px-4 py-3">Messages</th>
              <th className="px-4 py-3">Last Activity</th>
              <th className="px-4 py-3">Preview</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className={dashboardTableBodyClassName}>
            {sessions.map((session) => (
              <tr key={session.chat_id} className="transition hover:bg-[var(--color-surface-raised)]">
                <td className={`${dashboardTableStrongCellClassName} font-mono`}>
                  {session.chat_id}
                </td>
                <td className={dashboardTableCellClassName}>
                  {session.user_id ? (
                    <span className="font-mono text-xs">{session.user_id.substring(0, 8)}...</span>
                  ) : (
                    <span className="italic text-[var(--color-text-subtle)]">anonymous</span>
                  )}
                </td>
                <td className={dashboardTableCellClassName}>{session.message_count}</td>
                <td className={`${dashboardTableCellClassName} whitespace-nowrap`}>
                  {new Date(session.last_message_at).toLocaleString()}
                </td>
                <td className={`${dashboardTableCellClassName} max-w-xs truncate`}>
                  {session.first_message || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(session.chat_id)}
                    disabled={deletingId === session.chat_id || isPending}
                    className="text-[var(--color-signal-danger)] hover:text-[var(--color-signal-danger)]"
                  >
                    {deletingId === session.chat_id ? "..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DashboardTableShell>
    </div>
  );
}
