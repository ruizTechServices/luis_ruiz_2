// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\chat\AdminChatClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import type { ChatSession } from "@/lib/db/chat";

interface AdminChatClientProps {
  sessions: ChatSession[];
}

export default function AdminChatClient({ sessions }: AdminChatClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No chat sessions found.</p>
      </div>
    );
  }

  // Group sessions by user_id
  const userGroups = new Map<string, ChatSession[]>();
  sessions.forEach((s) => {
    const key = s.user_id ?? "anonymous";
    const arr = userGroups.get(key) ?? [];
    arr.push(s);
    userGroups.set(key, arr);
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Unique Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{userGroups.size}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Messages</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {sessions.reduce((acc, s) => acc + s.message_count, 0)}
          </p>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Session ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {sessions.map((session) => (
                <tr key={session.chat_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">
                    {session.chat_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {session.user_id ? (
                      <span className="font-mono text-xs">{session.user_id.substring(0, 8)}...</span>
                    ) : (
                      <span className="text-gray-400 italic">anonymous</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {session.message_count}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {new Date(session.last_message_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                    {session.first_message || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(session.chat_id)}
                      disabled={deletingId === session.chat_id || isPending}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 text-sm font-medium"
                    >
                      {deletingId === session.chat_id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
