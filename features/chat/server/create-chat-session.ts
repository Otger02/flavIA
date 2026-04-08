import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";
import type { ChatSession } from "@/features/chat/types";

type CreateChatSessionParams = {
  userId: string;
  sessionId?: string;
};

type ChatSessionRow = Database["public"]["Tables"]["chat_sessions"]["Row"];
type ChatSessionSelect = Pick<ChatSessionRow, "id" | "user_id" | "created_at" | "started_at" | "active_topic" | "message_count" | "free_messages_used" | "hit_paywall">;

function mapChatSession(row: ChatSessionSelect): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    startedAt: row.started_at,
    activeTopic: row.active_topic,
    messageCount: row.message_count,
    freeMessagesUsed: row.free_messages_used,
    hitPaywall: row.hit_paywall,
  };
}

export async function createChatSession({
  userId,
  sessionId,
}: CreateChatSessionParams): Promise<ChatSession> {
  const supabase = await createServerSupabaseClient();

  if (sessionId) {
    const { data: existingSession, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id, user_id, created_at, started_at, active_topic, message_count, free_messages_used, hit_paywall")
      .eq("id", sessionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Unable to load chat session: ${fetchError.message}`);
    }

    if (existingSession) {
      return mapChatSession(existingSession);
    }
  }

  const insertPayload = sessionId
    ? { id: sessionId, user_id: userId }
    : { user_id: userId };

  const { data: createdSession, error: insertError } = await supabase
    .from("chat_sessions")
    .insert(insertPayload)
    .select("id, user_id, created_at, started_at, active_topic, message_count, free_messages_used, hit_paywall")
    .single();

  if (insertError) {
    throw new Error(`Unable to create chat session: ${insertError.message}`);
  }

  return mapChatSession(createdSession);
}
