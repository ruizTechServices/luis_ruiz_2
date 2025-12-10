// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\api\chat\sessions\[chatId]\route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { deleteChatSession, getChatMessages } from "@/lib/db/chat";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ chatId: string }>;
}

/**
 * DELETE /api/chat/sessions/[chatId]
 * Delete a chat session. Users can delete their own; admins can delete any.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerClient();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await context.params;
    const chatIdNum = parseInt(chatId, 10);
    if (isNaN(chatIdNum)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    // Check if admin
    const isAdmin = isOwner(user.email);

    if (isAdmin) {
      // Admin can delete any session
      await deleteChatSession(chatIdNum);
    } else {
      // User can only delete their own
      await deleteChatSession(chatIdNum, user.id);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/chat/sessions/[chatId]]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/sessions/[chatId]
 * Get messages for a chat session.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerClient();
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await context.params;
    const chatIdNum = parseInt(chatId, 10);
    if (isNaN(chatIdNum)) {
      return NextResponse.json({ error: "Invalid chat ID" }, { status: 400 });
    }

    const isAdmin = isOwner(user.email);
    const messages = await getChatMessages(chatIdNum, isAdmin ? undefined : user.id);

    return NextResponse.json(messages);
  } catch (e) {
    console.error("[GET /api/chat/sessions/[chatId]]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
