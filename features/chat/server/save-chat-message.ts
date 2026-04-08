import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatRole } from "@/features/chat/types";
import type { Database } from "@/types/db";

type SaveChatMessageParams = {
  sessionId: string;
  userId: string;
  role: ChatRole;
  content: string;
  metadata?: Record<string, unknown>;
};

type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];
type ChatMessageSelect = Pick<ChatMessageRow, "id" | "session_id" | "role" | "content" | "created_at">;

function mapChatMessage(row: ChatMessageSelect): ChatMessage {
  return {
    id: row.id,
    sessionId: row.session_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function saveChatMessage({
  sessionId,
  userId,
  role,
  content,
  metadata,
}: SaveChatMessageParams): Promise<ChatMessage> {
  const supabase = await createServerSupabaseClient();

  const { data: message, error: insertError } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      metadata: (metadata ?? {}) as Database["public"]["Tables"]["chat_messages"]["Insert"]["metadata"],
    })
    .select("id, session_id, role, content, created_at, user_id")
    .single();

  if (insertError) {
    throw new Error(`Unable to save chat message: ${insertError.message}`);
  }

  return mapChatMessage(message);
}
