import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type ChatSessionRow = Database["public"]["Tables"]["chat_sessions"]["Row"];

export type RecentChatSession = {
  id: string;
  createdAt: string;
  activeTopic: ChatSessionRow["active_topic"];
  messageCount: number;
};

type GetRecentChatSessionsParams = {
  limit?: number;
  userId: string;
};

export async function getRecentChatSessions({
  limit = 5,
  userId,
}: GetRecentChatSessionsParams): Promise<RecentChatSession[]> {
  const supabase = await createServerSupabaseClient();

  const { data: sessions, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select("id, created_at, active_topic, message_count")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sessionsError) {
    throw new Error(`Unable to load recent chat sessions: ${sessionsError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  return sessions.map((session) => ({
    id: session.id,
    createdAt: session.created_at,
    activeTopic: session.active_topic,
    messageCount: session.message_count,
  }));
}
