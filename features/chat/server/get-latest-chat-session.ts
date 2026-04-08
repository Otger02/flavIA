import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatSession } from "@/features/chat/types";
import type { Database } from "@/types/db";

type GetLatestChatSessionParams = {
  userId: string;
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

export async function getLatestChatSession({
  userId,
}: GetLatestChatSessionParams): Promise<ChatSession | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, user_id, created_at, started_at, active_topic, message_count, free_messages_used, hit_paywall")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load latest chat session: ${error.message}`);
  }

  return data ? mapChatSession(data) : null;
}
