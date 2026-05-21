import "server-only";

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

import { getAiModelConfig, getAiProviderKeys } from "@/lib/env";
import type { ChatMessage } from "@/features/chat/types";

const { openAiChatModel: OPENAI_MODEL, anthropicChatModel: ANTHROPIC_MODEL } =
  getAiModelConfig();

const SUMMARY_SYSTEM_PROMPT = `Eres Flavia, una sexóloga y terapeuta de pareja.
Genera un resumen breve y cálido de la conversación que acabas de tener.

Directrices:
- Escribe en segunda persona dirigiéndote a la usuaria
- 3-5 frases máximo
- Tono cálido, empático, no clínico
- Destaca los temas principales tocados
- Si hubo un insight o momento de apertura, menciónalo
- Cierra con algo esperanzador o que invite a la reflexión
- NO uses emojis
- Escribe en español`;

export async function generateSessionSummary(
  messages: ChatMessage[],
): Promise<string | null> {
  if (messages.length < 4) {
    return null; // Too short to summarize
  }

  const conversation = messages
    .map((m) => `${m.role === "user" ? "Usuaria" : "Flavia"}: ${m.content}`)
    .join("\n\n");

  const userPrompt = `Resume esta conversación para la usuaria:\n\n${conversation}`;

  const { openAiApiKey, anthropicApiKey } = getAiProviderKeys();

  // Try OpenAI first
  if (openAiApiKey) {
    try {
      const client = new OpenAI({ apiKey: openAiApiKey });
      const completion = await client.chat.completions.create({
        model: OPENAI_MODEL,
        temperature: 0.6,
        max_tokens: 300,
        messages: [
          { role: "system", content: SUMMARY_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });

      const content = completion.choices[0]?.message?.content?.trim();
      if (content) return content;
    } catch (error) {
      console.error("[summary] OpenAI failed:", error);
    }
  }

  // Fallback to Anthropic
  if (anthropicApiKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicApiKey });
      const response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 300,
        system: SUMMARY_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const content = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();

      if (content) return content;
    } catch (error) {
      console.error("[summary] Anthropic failed:", error);
    }
  }

  return null;
}
