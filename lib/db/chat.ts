// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\lib\db\chat.ts
import { createClient as createServerClient } from "@/lib/clients/supabase/server";

export interface ChatMessage {
  id: number;
  chat_id: number;
  message: string;
  created_at: string;
  user_id: string | null;
}

export interface ChatSession {
  chat_id: number;
  message_count: number;
  first_message: string;
  last_message_at: string;
  user_id: string | null;
}

export interface Conversation {
  conversation_id: string;
  position_id: number;
  timestamp: string;
  role: "user" | "assistant";
  message: string;
  user_id: string | null;
}

async function supa() {
  return createServerClient();
}

/**
 * Groups a flat list of chat messages into sessions keyed by chat_id.
 */
function groupMessagesIntoSessions(messages: ChatMessage[]): ChatSession[] {
  const sessionsMap = new Map<number, ChatMessage[]>();
  messages.forEach((msg) => {
    const msgs = sessionsMap.get(msg.chat_id) ?? [];
    msgs.push(msg);
    sessionsMap.set(msg.chat_id, msgs);
  });

  const sessions: ChatSession[] = [];
  sessionsMap.forEach((msgs, chatId) => {
    const sorted = msgs.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    sessions.push({
      chat_id: chatId,
      message_count: msgs.length,
      first_message: sorted[0]?.message?.substring(0, 100) ?? "",
      last_message_at: sorted[sorted.length - 1]?.created_at ?? "",
      user_id: msgs[0]?.user_id ?? null,
    });
  });

  return sessions.sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  );
}

// ─────────────────────────────────────────────────────────────
// Per-user chat functions
// ─────────────────────────────────────────────────────────────

/**
 * Get chat sessions for a specific user.
 * Groups chat_messages by chat_id.
 */
export async function getChatSessionsForUser(userId: string): Promise<ChatSession[]> {
  const supabase = await supa();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, chat_id, message, created_at, user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return groupMessagesIntoSessions(data as ChatMessage[]);
}

/**
 * Get messages for a specific chat session.
 */
export async function getChatMessages(chatId: number, userId?: string): Promise<ChatMessage[]> {
  const supabase = await supa();

  let query = supabase
    .from("chat_messages")
    .select("id, chat_id, message, created_at, user_id")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

/**
 * Delete a chat session (all messages with that chat_id).
 */
export async function deleteChatSession(chatId: number, userId?: string): Promise<void> {
  const supabase = await supa();

  let query = supabase.from("chat_messages").delete().eq("chat_id", chatId);
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;
  if (error) throw error;

  // Also delete related embeddings
  await supabase.from("chat_embeddings").delete().eq("chat_id", chatId);
}

// ─────────────────────────────────────────────────────────────
// Admin functions (all users)
// ─────────────────────────────────────────────────────────────

/**
 * Get all chat sessions (admin view).
 */
export async function getAllChatSessions(): Promise<ChatSession[]> {
  const supabase = await supa();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, chat_id, message, created_at, user_id")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  return groupMessagesIntoSessions(data as ChatMessage[]);
}

/**
 * Get conversations for a user.
 */
export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  const supabase = await supa();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Conversation[];
}

/**
 * Get all conversations (admin view).
 */
export async function getAllConversations(): Promise<Conversation[]> {
  const supabase = await supa();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Conversation[];
}
