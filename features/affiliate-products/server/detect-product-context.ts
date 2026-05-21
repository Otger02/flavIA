import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { getAiModelConfig, getAiProviderKeys } from "@/lib/env";
import {
  AFFILIATE_CONTEXT_TAGS,
  type AffiliateContextTag,
} from "@/features/affiliate-products/constants";
import type { ChatMessage } from "@/features/chat/types";

/**
 * Output shape from `detectProductContext`. Everything needed by the
 * selection step + analytics. `shouldRecommend` is the orchestrator's
 * single source of truth — when false, no further work runs.
 */
export type ProductContextDetection = {
  contextTags: AffiliateContextTag[];
  keywords: string[];
  confidence: "low" | "medium" | "high";
  shouldRecommend: boolean;
  reason?: string;
};

const HAIKU_MODEL = getAiModelConfig().anthropicClassifierModel;
const MAX_DETECTION_LATENCY_MS = 4000;

/**
 * Hard keyword guard. If ANY of these substrings appear (case-insensitive)
 * in the latest user message OR the most recent assistant message, no
 * recommendation runs. The user spec is explicit: recommendations never
 * appear in safety-critical conversations.
 *
 * Kept as plain substrings (not word-boundary regex) so multi-word
 * phrases match. Conservative on purpose — false positives mean a missed
 * recommendation, not harm.
 */
const SAFETY_CRITICAL_PATTERNS = [
  // Sexual / physical violence
  "abuso",
  "abusada",
  "abusado",
  "violación",
  "violacion",
  "me violaron",
  "me violó",
  "me agredió",
  "me pegó",
  "me pega",
  "me golpea",
  "me golpeó",
  "me amenaza",
  "tengo miedo de mi pareja",
  "violencia",
  "maltrato",
  "maltratada",
  // Self-harm / suicidal ideation
  "suicidio",
  "suicidarme",
  "matarme",
  "me quiero matar",
  "no quiero vivir",
  "autolesión",
  "autolesion",
  "me corté",
  "me corto",
  // Narcissistic abuse — soft keyword (the topic itself is in the
  // referral list, so even mention triggers caution)
  "narcisista",
  "narcisismo",
  // Grief / acute crisis
  "se murió",
  "murió mi",
  "acabo de perder",
] as const;

function detectSafetyCritical(messages: ChatMessage[]): string | null {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const haystack = `${lastUser?.content ?? ""}\n${lastAssistant?.content ?? ""}`.toLowerCase();
  for (const pattern of SAFETY_CRITICAL_PATTERNS) {
    if (haystack.includes(pattern)) {
      return pattern;
    }
  }
  return null;
}

const CLASSIFIER_SYSTEM_PROMPT = `You are a tag extractor. Read the most recent user message (and minimal context if helpful) and extract situational tags from this exact list, lowercased, no other tags allowed:

${AFFILIATE_CONTEXT_TAGS.join(", ")}

Output JSON only, no commentary, no markdown fences. Schema:

{"contextTags": string[], "keywords": string[]}

- contextTags: zero or more tags from the list above. Empty array if nothing fits.
- keywords: zero to 5 short Spanish noun phrases lifted directly from the user message that informed the tags (e.g. "sequedad vaginal", "primera vez con juguetes"). Lowercase. No quotes.

Be conservative. If the user is venting about feelings without naming a concrete situation a product could help with, return empty arrays.`;

function buildClassifierUserPrompt(
  userMessage: string,
  recentMessages: ChatMessage[],
): string {
  const trimmed = recentMessages
    .filter((m) => m.role !== "system")
    .slice(-4)
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n");

  return `Conversation context (most recent first):\n${trimmed}\n\nLatest user message:\n${userMessage}`;
}

function parseClassifierResponse(raw: string): {
  contextTags: AffiliateContextTag[];
  keywords: string[];
} {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { contextTags: [], keywords: [] };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { contextTags: [], keywords: [] };
  }
  const obj = parsed as Record<string, unknown>;

  const validTagSet = new Set<string>(AFFILIATE_CONTEXT_TAGS);
  const rawTags = Array.isArray(obj.contextTags) ? obj.contextTags : [];
  const rawKeywords = Array.isArray(obj.keywords) ? obj.keywords : [];

  const contextTags = rawTags
    .filter((value): value is string => typeof value === "string")
    .filter((value) => validTagSet.has(value)) as AffiliateContextTag[];

  const keywords = rawKeywords
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0 && value.length <= 80)
    .slice(0, 5);

  return { contextTags, keywords };
}

function deriveConfidence(tagCount: number): ProductContextDetection["confidence"] {
  if (tagCount >= 2) return "high";
  if (tagCount === 1) return "medium";
  return "low";
}

/**
 * Returns a detection result. Never throws — on Haiku failure, returns
 * a `shouldRecommend: false` result with a `reason`. The orchestrator
 * treats that the same as "no match".
 */
export async function detectProductContext(params: {
  userMessage: string;
  recentMessages: ChatMessage[];
  turnCount: number;
}): Promise<ProductContextDetection> {
  const { userMessage, recentMessages, turnCount } = params;

  // Hard guard 1: turn count
  if (turnCount < 3) {
    return {
      contextTags: [],
      keywords: [],
      confidence: "low",
      shouldRecommend: false,
      reason: "turn_count_below_threshold",
    };
  }

  // Hard guard 2: safety-critical content
  const safetyHit = detectSafetyCritical([
    ...recentMessages,
    {
      id: "current-user",
      sessionId: "",
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    },
  ]);
  if (safetyHit) {
    return {
      contextTags: [],
      keywords: [],
      confidence: "low",
      shouldRecommend: false,
      reason: `safety_critical:${safetyHit}`,
    };
  }

  const { anthropicApiKey } = getAiProviderKeys();
  if (!anthropicApiKey) {
    return {
      contextTags: [],
      keywords: [],
      confidence: "low",
      shouldRecommend: false,
      reason: "no_anthropic_key",
    };
  }

  try {
    const client = new Anthropic({ apiKey: anthropicApiKey });

    const completion = await Promise.race([
      client.messages.create({
        model: HAIKU_MODEL,
        max_tokens: 200,
        system: CLASSIFIER_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: buildClassifierUserPrompt(userMessage, recentMessages),
          },
        ],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("haiku_timeout")), MAX_DETECTION_LATENCY_MS),
      ),
    ]);

    const text = completion.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    const { contextTags, keywords } = parseClassifierResponse(text);
    const confidence = deriveConfidence(contextTags.length);

    return {
      contextTags,
      keywords,
      confidence,
      shouldRecommend: confidence !== "low",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.warn(`[affiliate-detect] classifier failed: ${message}`);
    return {
      contextTags: [],
      keywords: [],
      confidence: "low",
      shouldRecommend: false,
      reason: `classifier_error:${message}`,
    };
  }
}
