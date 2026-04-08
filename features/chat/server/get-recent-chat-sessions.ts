import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type ChatSessionRow = Database["public"]["Tables"]["chat_sessions"]["Row"];
type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

export type RecentChatSession = {
  id: string;
  updatedAt: string;
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
    .select("id, updated_at, active_topic")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (sessionsError) {
    throw new Error(`Unable to load recent chat sessions: ${sessionsError.message}`);
  }

  if (!sessions || sessions.length === 0) {
    return [];
  }

  const sessionIds = sessions.map((session) => session.id);
  const { data: messages, error: messagesError } = await supabase
    .from("chat_messages")
    .select("session_id")
    .in("session_id", sessionIds);

  if (messagesError) {
    throw new Error(`Unable to count chat messages: ${messagesError.message}`);
  }

  const messageCountBySession = (messages ?? []).reduce<Record<string, number>>((counts, message) => {
    counts[message.session_id] = (counts[message.session_id] ?? 0) + 1;
    return counts;
  }, {});

  return sessions.map((session) => ({
    id: session.id,
    updatedAt: session.updated_at,
    activeTopic: session.active_topic,
    messageCount: messageCountBySession[session.id] ?? 0,
  }));
}