import "server-only";

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
  // Cannot write user_state_summary or updated_at to chat_sessions.
  // Stubbed out until the column is added to the schema.
  void session;
  void assistantMessage;

  return { shouldPersist: false, summary: null };
}
