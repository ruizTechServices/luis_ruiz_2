// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\chat\page.tsx
import "server-only";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { getAllChatSessions, type ChatSession } from "@/lib/db/chat";
import {
  DashboardErrorState,
  DashboardPageHeader,
  DashboardPageShell,
  DashboardStatusBadge,
} from "@/components/design-system/DashboardPrimitives";
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
    <DashboardPageShell>
      <DashboardPageHeader
        title="Chat Admin"
        description="View and manage all chat sessions."
        meta={<DashboardStatusBadge>{sessions.length} total</DashboardStatusBadge>}
      />

      {error && (
        <DashboardErrorState>
          <p>{error}</p>
        </DashboardErrorState>
      )}

      <AdminChatClient sessions={sessions} />
    </DashboardPageShell>
  );
}
