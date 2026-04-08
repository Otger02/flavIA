import "server-only";

import { getChatSystemPrompt } from "@/lib/ai/prompts/chat-system-prompt";
import type { ChatContext, ChatMessage, ChatSession } from "@/features/chat/types";

type BuildChatContextParams = {
  session: ChatSession;
  history: ChatMessage[];
};

export async function buildChatContext({
  session,
  history,
}: BuildChatContextParams): Promise<ChatContext> {
  const partialContext: ChatContext = {
    sessionId: session.id,
    systemPrompt: "",
    recentMessages: history,
    activeTopic: session.activeTopic,
    userStateSummary: null,
  };

  // Build the real system prompt using the full context
  partialContext.systemPrompt = getChatSystemPrompt(partialContext);

  return partialContext;
}
