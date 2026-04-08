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
  void session;
  void assistantMessage;

  return {
    shouldPersist: false,
    summary: null,
  };
}