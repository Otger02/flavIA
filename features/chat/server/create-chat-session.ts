import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";
import type { ChatSession } from "@/features/chat/types";

type CreateChatSessionParams = {
  userId: string;
  sessionId?: string;
};

type ChatSessionRow = Database["public"]["Tables"]["chat_sessions"]["Row"];

function mapChatSession(row: ChatSessionRow): ChatSession {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    activeTopic: row.active_topic,
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
      .select("id, user_id, created_at, updated_at, status, active_topic")
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
    ? { id: sessionId, user_id: userId, status: "active" as const }
    : { user_id: userId, status: "active" as const };

  const { data: createdSession, error: insertError } = await supabase
    .from("chat_sessions")
    .insert(insertPayload)
    .select("id, user_id, created_at, updated_at, status, active_topic")
    .single();

  if (insertError) {
    throw new Error(`Unable to create chat session: ${insertError.message}`);
  }

  return mapChatSession(createdSession);
}