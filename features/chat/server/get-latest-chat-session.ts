import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatSession } from "@/features/chat/types";
import type { Database } from "@/types/db";

type GetLatestChatSessionParams = {
  userId: string;
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

export async function getLatestChatSession({
  userId,
}: GetLatestChatSessionParams): Promise<ChatSession | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, user_id, created_at, updated_at, status, active_topic")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load latest chat session: ${error.message}`);
  }

  return data ? mapChatSession(data) : null;
}