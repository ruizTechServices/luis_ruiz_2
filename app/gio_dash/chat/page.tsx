// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\chat\page.tsx
import "server-only";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { getAllChatSessions, type ChatSession } from "@/lib/db/chat";
import AdminChatClient from "./AdminChatClient";

export default async function AdminChatPage() {
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

  // Fetch all chat sessions
  let sessions: ChatSession[] = [];
  let error: string | null = null;
  try {
    sessions = await getAllChatSessions();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch chat sessions";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Chat Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage all chat sessions ({sessions.length} total)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <AdminChatClient sessions={sessions} />
      </div>
    </div>
  );
}
