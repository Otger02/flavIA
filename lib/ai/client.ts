import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { getAiProviderKeys } from "@/lib/env";
import { getChatSystemPrompt } from "@/lib/ai/prompts/chat-system-prompt";
import type { ChatContext } from "@/features/chat/types";

const OPENAI_MODEL = "gpt-4.1-mini";
const ANTHROPIC_MODEL = "claude-3-5-sonnet-latest";

type GenerateChatResponseResult = {
  content: string;
  model: string;
  provider: "openai" | "anthropic";
};

function getLatestUserMessage(context: ChatContext) {
  return [...context.recentMessages].reverse().find((message) => message.role === "user") ?? null;
}

function getConversationMessages(context: ChatContext) {
  return context.recentMessages
    .filter((message) => message.role !== "system")
    .map(
      (message): ChatCompletionMessageParam => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content,
      }),
    );
}

function getAnthropicConversationMessages(context: ChatContext): MessageParam[] {
  return context.recentMessages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.content,
    }));
}

async function generateWithOpenAI(context: ChatContext, apiKey: string): Promise<GenerateChatResponseResult> {
  const client = new OpenAI({ apiKey });
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: getChatSystemPrompt(context),
    },
    ...getConversationMessages(context),
  ];

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.7,
    messages,
  });

  const content = completion.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return {
    content,
    model: OPENAI_MODEL,
    provider: "openai",
  };
}

async function generateWithAnthropic(
  context: ChatContext,
  apiKey: string,
): Promise<GenerateChatResponseResult> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 500,
    system: getChatSystemPrompt(context),
    messages: getAnthropicConversationMessages(context),
  });

  const content = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!content) {
    throw new Error("Anthropic returned an empty response.");
  }

  return {
    content,
    model: ANTHROPIC_MODEL,
    provider: "anthropic",
  };
}

export async function generateChatResponse(context: ChatContext): Promise<GenerateChatResponseResult> {
  const { anthropicApiKey, openAiApiKey } = getAiProviderKeys();
  const errors: string[] = [];

  if (openAiApiKey) {
    try {
      return await generateWithOpenAI(context, openAiApiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OpenAI error";
      errors.push(`OpenAI: ${message}`);
    }
  }

  if (anthropicApiKey) {
    try {
      return await generateWithAnthropic(context, anthropicApiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Anthropic error";
      errors.push(`Anthropic: ${message}`);
    }
  }

  if (errors.length > 0) {
    console.error("[AI] All providers failed:", errors.join("; "));
  } else {
    console.error("[AI] No API keys configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.");
  }

  const latestUserMessage = getLatestUserMessage(context);

  return {
    content: latestUserMessage
      ? `Estoy teniendo un problema temporal para generar una respuesta completa. Mientras tanto, entiendo que dices: "${latestUserMessage.content}".`
      : "Estoy teniendo un problema temporal para responder ahora mismo.",
    model: "fallback",
    provider: openAiApiKey ? "openai" : anthropicApiKey ? "anthropic" : "openai",
  };
}

// --- Streaming ---

type StreamResult = {
  stream: AsyncIterable<string>;
  model: string;
  provider: "openai" | "anthropic";
};

async function streamWithOpenAI(context: ChatContext, apiKey: string): Promise<StreamResult> {
  const client = new OpenAI({ apiKey });
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: getChatSystemPrompt(context) },
    ...getConversationMessages(context),
  ];

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    temperature: 0.7,
    messages,
    stream: true,
  });

  async function* iterateChunks() {
    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  return { stream: iterateChunks(), model: OPENAI_MODEL, provider: "openai" };
}

async function streamWithAnthropic(context: ChatContext, apiKey: string): Promise<StreamResult> {
  const client = new Anthropic({ apiKey });
  const response = client.messages.stream({
    model: ANTHROPIC_MODEL,
    max_tokens: 500,
    system: getChatSystemPrompt(context),
    messages: getAnthropicConversationMessages(context),
  });

  async function* iterateChunks() {
    for await (const event of response) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
  }

  return { stream: iterateChunks(), model: ANTHROPIC_MODEL, provider: "anthropic" };
}

export async function generateChatResponseStream(context: ChatContext): Promise<StreamResult> {
  const { anthropicApiKey, openAiApiKey } = getAiProviderKeys();
  const errors: string[] = [];

  if (openAiApiKey) {
    try {
      return await streamWithOpenAI(context, openAiApiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OpenAI error";
      errors.push(`OpenAI stream: ${message}`);
    }
  }

  if (anthropicApiKey) {
    try {
      return await streamWithAnthropic(context, anthropicApiKey);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Anthropic error";
      errors.push(`Anthropic stream: ${message}`);
    }
  }

  if (errors.length > 0) {
    console.error("[AI] All streaming providers failed:", errors.join("; "));
  } else {
    console.error("[AI] No API keys configured for streaming.");
  }

  // Fallback: return a single-chunk "stream" with the error message
  const latestUserMessage = getLatestUserMessage(context);
  const fallbackContent = latestUserMessage
    ? `Estoy teniendo un problema temporal para generar una respuesta completa. Mientras tanto, entiendo que dices: "${latestUserMessage.content}".`
    : "Estoy teniendo un problema temporal para responder ahora mismo.";

  async function* fallbackStream() {
    yield fallbackContent;
  }

  return { stream: fallbackStream(), model: "fallback", provider: "openai" };
}