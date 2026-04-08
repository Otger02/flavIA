import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  ChatMessage,
  ChatSession,
  ChatUserStateUpdate,
} from "@/features/chat/types";

type UpdateUserStateParams = {
  session: ChatSession;
  assistantMessage: ChatMessage;
};

export async function updateUserState({
  session,
  assistantMessage,
}: UpdateUserStateParams): Promise<ChatUserStateUpdate> {
  // Persist a lightweight summary of the session's emotional trajectory.
  // This enables cross-session memory: next time the user returns,
  // the system prompt includes where they left off.

  if (!session.activeTopic) {
    return { shouldPersist: false, summary: null };
  }

  const summary = [
    `Último tema: ${session.activeTopic}.`,
    `Último mensaje de Flavia: "${assistantMessage.content.slice(0, 200)}"`,
  ].join(" ");

  try {
    const supabase = await createServerSupabaseClient();

    await supabase
      .from("chat_sessions")
      .update({
        user_state_summary: summary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .eq("user_id", session.userId);

    return { shouldPersist: true, summary };
  } catch {
    // Non-critical — the chat still works without persisted state
    return { shouldPersist: false, summary: null };
  }
}
