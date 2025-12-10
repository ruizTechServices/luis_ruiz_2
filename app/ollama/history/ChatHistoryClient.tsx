// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\ollama\history\ChatHistoryClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
import type { ChatSession } from "@/lib/db/chat";

interface ChatHistoryClientProps {
  sessions: ChatSession[];
  userId: string;
}

export default function ChatHistoryClient({ sessions, userId }: ChatHistoryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleDelete = async (chatId: number) => {
    if (!confirm("Delete this chat session? This cannot be undone.")) return;

    setDeletingId(chatId);
    try {
      const res = await fetch(`/api/chat/sessions/${chatId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
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
        <p className="text-gray-500 dark:text-gray-400 mb-4">No chat history yet.</p>
        <Link href="/ollama" className="text-blue-600 hover:underline font-medium">
          Start a new chat
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div
          key={session.chat_id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div
            className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => setExpandedId(expandedId === session.chat_id ? null : session.chat_id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-white font-medium truncate">
                  {session.first_message || "Empty session"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{new Date(session.last_message_at).toLocaleString()}</span>
                  <span>{session.message_count} messages</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(session.chat_id);
                  }}
                  disabled={deletingId === session.chat_id || isPending}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                  {deletingId === session.chat_id ? "..." : "Delete"}
                </button>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === session.chat_id ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {expandedId === session.chat_id && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Session ID: {session.chat_id}
              </p>
              <Link
                href={`/ollama?chat_id=${session.chat_id}`}
                className="inline-block mt-2 text-sm text-blue-600 hover:underline"
              >
                Continue this conversation →
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
