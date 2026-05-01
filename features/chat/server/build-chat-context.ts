import "server-only";

import { canAccessPlus } from "@/features/billing/access";
import { getChatSystemPrompt } from "@/lib/ai/prompts/chat-system-prompt";
import type { UserPlan } from "@/features/billing/types";
import type { ChatContext, ChatMessage, ChatSession } from "@/features/chat/types";

type BuildChatContextParams = {
  session: ChatSession;
  history: ChatMessage[];
  // Caller-provided. Same plan instance enforceUsagePolicy received — fetched
  // once per turn by the orchestrator and threaded through to dedupe a DB
  // round-trip. `null` means the user is anonymous / page render didn't load
  // a plan, treated as non-Plus.
  plan: UserPlan | null;
};

export async function buildChatContext({
  session,
  history,
  plan,
}: BuildChatContextParams): Promise<ChatContext> {
  const turnCount = history.filter((message) => message.role === "user").length;
  // Tier-aware: Pro inherits Plus, so Pro users also render as "Flavia Plus"
  // in the system prompt. The flag name `isPlusUser` is kept for now to
  // avoid touching the prompt template — semantically it means "Plus or
  // better, with active/trialing entitlement".
  const isPlusUser = canAccessPlus(plan);

  const partialContext: ChatContext = {
    sessionId: session.id,
    systemPrompt: "",
    recentMessages: history,
    activeTopic: session.activeTopic,
    userStateSummary: null,
    topic: session.activeTopic ?? undefined,
    turnCount,
    isPlusUser,
  };

  // Build the real system prompt using the full context
  partialContext.systemPrompt = getChatSystemPrompt(partialContext);

  return partialContext;
}
