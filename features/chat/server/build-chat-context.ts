import "server-only";

import { CHAT_DEFAULT_SYSTEM_PROMPT } from "@/features/chat/constants";
import type { ChatContext, ChatMessage, ChatSession } from "@/features/chat/types";

type BuildChatContextParams = {
  session: ChatSession;
  history: ChatMessage[];
};

export async function buildChatContext({
  session,
  history,
}: BuildChatContextParams): Promise<ChatContext> {
  return {
    sessionId: session.id,
    systemPrompt: CHAT_DEFAULT_SYSTEM_PROMPT,
    recentMessages: history,
    activeTopic: session.activeTopic,
    userStateSummary: null,
  };
}