import "server-only";

import { CHAT_HISTORY_LIMIT } from "@/features/chat/constants";
import type { ChatMessage } from "@/features/chat/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type GetChatHistoryParams = {
  sessionId: string;
  limit?: number;
};

type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

function mapChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function getChatHistory({
  sessionId,
  limit = CHAT_HISTORY_LIMIT,
}: GetChatHistoryParams): Promise<ChatMessage[]> {
  const supabase = await createServerSupabaseClient();

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("id, session_id, role, content, created_at, user_id")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Unable to load chat history: ${error.message}`);
  }

  return [...messages].reverse().map(mapChatMessage);
}