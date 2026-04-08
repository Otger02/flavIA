import { CHAT_TOPICS } from "@/features/chat/constants";
import type { ChatMessage } from "@/features/chat/types";

type TopicDetectionPromptParams = {
  recentMessages: ChatMessage[];
};

export function getTopicDetectionPrompt({ recentMessages }: TopicDetectionPromptParams) {
  const conversationSnippet = recentMessages
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return [
    "Classify the main user topic of this intimate wellbeing conversation.",
    `Allowed topics only: ${CHAT_TOPICS.join(", ")}.`,
    'Return exactly one token: one allowed topic, or "null" if none is clearly dominant.',
    "Do not explain your answer.",
    "Conversation:",
    conversationSnippet,
  ].join("\n");
}