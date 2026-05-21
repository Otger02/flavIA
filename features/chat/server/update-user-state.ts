import "server-only";

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

import { getAiModelConfig, getAiProviderKeys } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { ChatMessage, ChatSession, ChatUserStateUpdate } from "@/features/chat/types";

type UpdateUserStateParams = {
  session: ChatSession;
  assistantMessage: ChatMessage;
  recentMessages?: ChatMessage[];
};

const { openAiChatModel, anthropicChatModel } = getAiModelConfig();

const SYSTEM_PROMPT = `Eres un asistente interno de análisis. Tu única tarea es leer una conversación y escribir UNA frase corta (máximo 25 palabras) en español que describa el estado emocional actual de la usuaria y su tema principal de exploración. No uses nombres. No saludes. Solo la frase.`;

function buildConversationText(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => `${m.role === "user" ? "Usuaria" : "Asistente"}: ${m.content}`)
    .join("\n");
}

async function generateSummary(conversationText: string): Promise<string | null> {
  const { openAiApiKey, anthropicApiKey } = getAiProviderKeys();

  if (openAiApiKey) {
    try {
      const client = new OpenAI({ apiKey: openAiApiKey });
      const completion = await client.chat.completions.create({
        model: openAiChatModel,
        temperature: 0,
        max_tokens: 60,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: conversationText },
        ],
      });
      return completion.choices[0]?.message?.content?.trim() ?? null;
    } catch {
      // fall through to Anthropic
    }
  }

  if (anthropicApiKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicApiKey });
      const response = await client.messages.create({
        model: anthropicChatModel,
        max_tokens: 60,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: conversationText }],
      });
      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      return text || null;
    } catch {
      return null;
    }
  }

  return null;
}

// Summarise every N user turns to keep costs low.
const SUMMARISE_EVERY_N_TURNS = 3;

export async function updateUserState({
  session,
  assistantMessage,
  recentMessages = [],
}: UpdateUserStateParams): Promise<ChatUserStateUpdate> {
  const shouldRun =
    session.messageCount > 0 && session.messageCount % SUMMARISE_EVERY_N_TURNS === 0;

  if (!shouldRun) {
    return { shouldPersist: false, summary: null };
  }

  const messages = recentMessages.length > 0 ? recentMessages : [assistantMessage];
  const conversationText = buildConversationText(messages);
  if (!conversationText) {
    return { shouldPersist: false, summary: null };
  }

  const summary = await generateSummary(conversationText);
  if (!summary) {
    return { shouldPersist: false, summary: null };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ user_state_summary: summary })
    .eq("id", session.id);

  if (error) {
    console.error("[user-state] Failed to persist summary:", error.message);
    return { shouldPersist: false, summary: null };
  }

  return { shouldPersist: true, summary };
}
