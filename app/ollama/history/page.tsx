// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\ollama\history\page.tsx
import "server-only";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";
import { getChatSessionsForUser, type ChatSession } from "@/lib/db/chat";
import ChatHistoryClient from "./ChatHistoryClient";

export default async function ChatHistoryPage() {
  const supabase = await createServerClient();

  // Auth check: authenticated users only
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    redirect("/login");
  }

  // Fetch user's chat sessions
  let sessions: ChatSession[] = [];
  let error: string | null = null;
  try {
    sessions = await getChatSessionsForUser(user.id);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch chat history";
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="ss-container px-6 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-semibold tracking-normal">
            Chat History
          </h1>
          <p className="text-muted-foreground">
            {sessions.length} sessions
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border p-4">
            <p>{error}</p>
          </div>
        )}

        <ChatHistoryClient sessions={sessions} userId={user.id} />
      </div>
    </main>
  );
}
