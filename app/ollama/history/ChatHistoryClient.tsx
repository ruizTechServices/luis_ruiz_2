"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
import type { ChatSession } from "@/lib/db/chat";
import { Button } from "@/components/ui/button";

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
      <div className="rounded-md border bg-card p-8 text-center">
        <p className="mb-4 text-muted-foreground">No chat history yet.</p>
        <Button asChild variant="outline">
          <Link href="/ollama">Start a new chat</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sessions.map((session) => (
        <div key={session.chat_id} className="overflow-hidden rounded-md border bg-card">
          <div
            className="cursor-pointer p-4 hover:bg-muted"
            onClick={() => setExpandedId(expandedId === session.chat_id ? null : session.chat_id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {session.first_message || "Empty session"}
                </p>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{new Date(session.last_message_at).toLocaleString()}</span>
                  <span>{session.message_count} messages</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(session.chat_id);
                }}
                disabled={deletingId === session.chat_id || isPending}
                variant="outline"
                size="sm"
              >
                {deletingId === session.chat_id ? "..." : "Delete"}
              </Button>
            </div>
          </div>

          {expandedId === session.chat_id ? (
            <div className="border-t bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                Session ID: {session.chat_id}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={`/ollama?chat_id=${session.chat_id}`}>
                  Continue this conversation
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
