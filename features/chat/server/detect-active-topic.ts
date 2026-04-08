import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

import { CHAT_TOPICS } from "@/features/chat/constants";
import { getAiProviderKeys } from "@/lib/env";
import { getTopicDetectionPrompt } from "@/lib/ai/prompts/topic-detection-prompt";
import type { ChatMessage, ChatTopic } from "@/features/chat/types";

type DetectActiveTopicParams = {
  recentMessages: ChatMessage[];
};

const topicKeywordMap: Record<ChatTopic, string[]> = {
  desire: [
    "desire",
    "deseo",
    "fantasy",
    "fantasia",
    "arousal",
    "excited",
    "turn on",
    "libido",
    "placer",
    "atraccion",
    "atrae",
  ],
  couple_connection: [
    "partner",
    "pareja",
    "relationship",
    "together",
    "intimacy together",
    "bond",
    "distance",
    "disconnect",
    "desconexion",
    "cold",
    "far apart",
    "reconnect",
    "reconectar",
    "jealous",
    "celos",
  ],
  self_connection: ["self", "myself", "solo", "alone", "autoconocimiento", "inner", "identity", "who i am"],
  communication: [
    "talk",
    "communication",
    "say",
    "conversation",
    "boundary",
    "express",
    "comunicar",
    "decir",
    "how to tell",
    "no se como decir",
    "miedo a decir",
    "block",
    "bloqueo",
  ],
  body_confidence: ["body", "cuerpo", "confidence", "insecure", "appearance", "mirror", "shame", "vergüenza", "verguenza"],
  routine: ["routine", "habit", "ritual", "daily", "week", "practice", "consistency", "stuck", "same thing"],
  curiosity: ["curious", "explore", "new", "learn", "question", "wonder", "discover", "try", "experiment"],
};

const emotionTopicMap: Array<{ keywords: string[]; topic: ChatTopic }> = [
  {
    keywords: ["celos", "jealous", "jealousy", "inseguridad con mi pareja", "fear of losing"],
    topic: "couple_connection",
  },
  {
    keywords: ["bloqueo", "blocked", "freeze", "me callo", "no se como decir", "can't say it"],
    topic: "communication",
  },
  {
    keywords: ["miedo", "fear", "afraid", "panic", "anxiety", "ansiedad", "hacer daño"],
    topic: "communication",
  },
  {
    keywords: ["desconexion", "disconnect", "distant", "far", "cold", "reconectar"],
    topic: "couple_connection",
  },
  {
    keywords: ["deseo", "desire", "libido", "placer", "turn on", "arousal"],
    topic: "desire",
  },
];

function normalizeTopic(value: string | null | undefined): ChatTopic | null {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();
  return CHAT_TOPICS.includes(normalizedValue as ChatTopic) ? (normalizedValue as ChatTopic) : null;
}

function detectTopicHeuristically(recentMessages: ChatMessage[]): ChatTopic | null {
  const userMessages = recentMessages.filter((message) => message.role === "user");
  const latestMessage = userMessages.at(-1);

  if (!latestMessage) {
    return null;
  }

  const latestText = latestMessage.content.toLowerCase();
  const weightedScores = new Map<ChatTopic, number>();

  for (const topic of CHAT_TOPICS) {
    weightedScores.set(topic, 0);
  }

  userMessages.slice(-4).forEach((message, index, array) => {
    const weight = index === array.length - 1 ? 3 : 1;
    const content = message.content.toLowerCase();

    for (const topic of CHAT_TOPICS) {
      const matches = topicKeywordMap[topic].filter((keyword) => content.includes(keyword)).length;

      if (matches > 0) {
        weightedScores.set(topic, (weightedScores.get(topic) ?? 0) + matches * weight);
      }
    }
  });

  let bestTopic: ChatTopic | null = null;
  let bestScore = 0;

  for (const topic of CHAT_TOPICS) {
    const score = weightedScores.get(topic) ?? 0;

    if (score > bestScore) {
      bestTopic = topic;
      bestScore = score;
    }
  }

  if (bestScore > 0) {
    return bestTopic;
  }

  for (const emotionMapping of emotionTopicMap) {
    const hasEmotionMatch = emotionMapping.keywords.some((keyword) => latestText.includes(keyword));

    if (hasEmotionMatch) {
      return emotionMapping.topic;
    }
  }

  return null;
}

async function detectTopicWithOpenAI(recentMessages: ChatMessage[], apiKey: string) {
  const client = new OpenAI({ apiKey });
  const completion = await client.responses.create({
    model: "gpt-4.1-mini",
    input: getTopicDetectionPrompt({ recentMessages }),
  });

  return normalizeTopic(completion.output_text ?? null);
}

async function detectTopicWithAnthropic(recentMessages: ChatMessage[], apiKey: string) {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 30,
    messages: [
      {
        role: "user",
        content: getTopicDetectionPrompt({ recentMessages }),
      },
    ],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return normalizeTopic(text);
}

export async function detectActiveTopic({ recentMessages }: DetectActiveTopicParams): Promise<ChatTopic | null> {
  const heuristicTopic = detectTopicHeuristically(recentMessages);

  if (heuristicTopic) {
    return heuristicTopic;
  }

  const { anthropicApiKey, openAiApiKey } = getAiProviderKeys();

  if (openAiApiKey) {
    try {
      const topic = await detectTopicWithOpenAI(recentMessages, openAiApiKey);

      if (topic) {
        return topic;
      }
    } catch {
      // Fallback below.
    }
  }

  if (anthropicApiKey) {
    try {
      const topic = await detectTopicWithAnthropic(recentMessages, anthropicApiKey);

      if (topic) {
        return topic;
      }
    } catch {
      // Fallback to null.
    }
  }

  return null;
}