import "server-only";

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { getAiProviderKeys } from "@/lib/env";
import type { ModerationResult } from "@/features/community/types";

const MODERATION_PROMPT = `You are a content moderator for an intimate wellness platform run by sexologist Flavia Dos Santos.

The platform accepts open, respectful conversations about sexuality, desire, intimacy, relationships, and body confidence. Sexual topics are EXPECTED and WELCOME when discussed respectfully.

Content should be FLAGGED only if it contains:
- Direct threats or incitement to violence
- Non-consensual content or descriptions
- Content involving minors in any sexual context
- Spam, advertising, or phishing
- Doxxing or sharing private information
- Hate speech targeting identity groups

Content should be APPROVED if it:
- Discusses sexual topics respectfully (even if explicit)
- Shares personal experiences about intimacy
- Asks questions about desire, pleasure, or sexual health
- Expresses vulnerability about body image, relationships, etc.

Respond ONLY with a JSON object, no other text:
{ "decision": "approved" | "flagged" | "rejected", "confidence": 0.0-1.0, "reason": "brief explanation or null" }`;

async function moderateWithOpenAI(content: string, apiKey: string): Promise<ModerationResult> {
  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "system", content: MODERATION_PROMPT },
      { role: "user", content },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("OpenAI moderation returned empty response");

  return JSON.parse(raw) as ModerationResult;
}

async function moderateWithAnthropic(content: string, apiKey: string): Promise<ModerationResult> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 200,
    system: MODERATION_PROMPT,
    messages: [{ role: "user", content }],
  });

  const raw = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!raw) throw new Error("Anthropic moderation returned empty response");

  return JSON.parse(raw) as ModerationResult;
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  const { openAiApiKey, anthropicApiKey } = getAiProviderKeys();

  if (openAiApiKey) {
    try {
      return await moderateWithOpenAI(content, openAiApiKey);
    } catch (error) {
      console.error("[moderation] OpenAI failed:", error instanceof Error ? error.message : error);
    }
  }

  if (anthropicApiKey) {
    try {
      return await moderateWithAnthropic(content, anthropicApiKey);
    } catch (error) {
      console.error("[moderation] Anthropic failed:", error instanceof Error ? error.message : error);
    }
  }

  // If both providers fail, default to flagged (manual review)
  console.error("[moderation] All providers failed — defaulting to flagged");
  return {
    decision: "flagged",
    confidence: 0,
    reason: "Moderation providers unavailable",
  };
}
