"use client";

import { useEffect, useRef, useState } from "react";

import { CHAT_API_ROUTE } from "@/features/chat/constants";
import { ANALYTICS_EVENTS, trackClientEvent } from "@/lib/analytics/track";
import type { RecommendationCard } from "@/features/recommendations/types";
import {
  chatTurnResponseSchema,
  type ChatMessage,
  type ChatUsagePolicy,
  type ChatTurnResponse,
} from "@/features/chat/types";

type UseChatOptions = {
  initialMessages?: ChatMessage[];
  initialSessionId?: string;
  initialUsage?: ChatUsagePolicy | null;
};

// Extended message type for client-side streaming state
type ClientChatMessage = ChatMessage & { streaming?: boolean };

type UseChatResult = {
  error: string | null;
  loading: boolean;
  messages: ClientChatMessage[];
  hasHistory: boolean;
  recommendation: RecommendationCard | null;
  sendMessage: (text: string) => Promise<ChatTurnResponse | null>;
  sessionId: string | null;
  usage: ChatUsagePolicy | null;
};

function dedupeMessages(messages: ClientChatMessage[]): ClientChatMessage[] {
  const seen = new Set<string>();

  return messages.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }

    seen.add(message.id);
    return true;
  });
}

async function* readNDJSON(response: Response): AsyncGenerator<Record<string, unknown>> {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          yield JSON.parse(trimmed) as Record<string, unknown>;
        } catch {
          // Skip malformed lines
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer.trim()) as Record<string, unknown>;
      } catch {
        // Skip
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function useChat({
  initialMessages = [],
  initialSessionId,
  initialUsage = null,
}: UseChatOptions = {}): UseChatResult {
  const [messages, setMessages] = useState<ClientChatMessage[]>(dedupeMessages(initialMessages));
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationCard | null>(null);
  const [usage, setUsage] = useState<ChatUsagePolicy | null>(initialUsage);
  const paywallEventKeyRef = useRef<string | null>(null);
  const requestInFlightRef = useRef(false);
  const latestRequestIdRef = useRef<string | null>(null);

  const hasHistory = messages.length > 0;

  useEffect(() => {
    if (!usage?.requiresUpgrade) {
      return;
    }

    const eventKey = `${sessionId ?? "no-session"}:${usage.reason ?? "no-reason"}`;

    if (paywallEventKeyRef.current === eventKey) {
      return;
    }

    paywallEventKeyRef.current = eventKey;

    void trackClientEvent(ANALYTICS_EVENTS.paywallHit, {
      sessionId,
      reason: usage.reason ?? null,
      remainingTurns: usage.remainingTurns ?? null,
    });
  }, [sessionId, usage]);

  async function sendMessage(text: string): Promise<ChatTurnResponse | null> {
    const message = text.trim();

    if (!message || loading || usage?.requiresUpgrade || requestInFlightRef.current) {
      return null;
    }

    requestInFlightRef.current = true;
    setError(null);
    setLoading(true);
    setRecommendation(null);

    const isFirstUserMessage = !messages.some((messageItem) => messageItem.role === "user");

    if (isFirstUserMessage) {
      void trackClientEvent(ANALYTICS_EVENTS.firstMessageSent, {
        sessionId,
        surface: "chat",
      });
    }

    const optimisticMessage: ClientChatMessage = {
      id: crypto.randomUUID(),
      sessionId: sessionId ?? "pending-session",
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    const streamingPlaceholder: ClientChatMessage = {
      id: `streaming-${crypto.randomUUID()}`,
      sessionId: sessionId ?? "pending-session",
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      streaming: true,
    };

    latestRequestIdRef.current = optimisticMessage.id;

    setMessages((currentMessages) =>
      dedupeMessages([...currentMessages, optimisticMessage, streamingPlaceholder]),
    );

    try {
      const response = await fetch(CHAT_API_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          clientMessageId: optimisticMessage.id,
          sessionId: sessionId ?? undefined,
        }),
      });

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        const errorMsg = responseBody?.error ?? "Unable to process the chat turn.";
        setError(errorMsg);
        setRecommendation(null);
        setMessages((currentMessages) =>
          currentMessages.filter(
            (m) => m.id !== optimisticMessage.id && m.id !== streamingPlaceholder.id,
          ),
        );
        return null;
      }

      // Check if response is streaming (NDJSON) or regular JSON
      const contentType = response.headers.get("Content-Type") ?? "";

      if (contentType.includes("application/x-ndjson")) {
        // Streaming path
        let finalPayload: ChatTurnResponse | null = null;

        for await (const event of readNDJSON(response)) {
          if (event.type === "token" && typeof event.content === "string") {
            setMessages((currentMessages) =>
              currentMessages.map((m) =>
                m.id === streamingPlaceholder.id
                  ? { ...m, content: m.content + event.content }
                  : m,
              ),
            );
          } else if (event.type === "done") {
            const parsed = chatTurnResponseSchema.safeParse(event);
            if (parsed.success) {
              finalPayload = parsed.data;
            }
          } else if (event.type === "error") {
            setError(typeof event.message === "string" ? event.message : "Streaming error");
          }
        }

        if (finalPayload && latestRequestIdRef.current === optimisticMessage.id) {
          setSessionId(finalPayload.session.id);
          setMessages(dedupeMessages(finalPayload.messages));
          setRecommendation(finalPayload.recommendation);
          setUsage(finalPayload.usage);
          return finalPayload;
        }

        // If no done event but we got tokens, remove the streaming flag
        setMessages((currentMessages) =>
          currentMessages.map((m) =>
            m.id === streamingPlaceholder.id ? { ...m, streaming: false } : m,
          ),
        );

        return finalPayload;
      }

      // Fallback: regular JSON response (non-streaming)
      const payload = chatTurnResponseSchema.parse(await response.json());

      if (latestRequestIdRef.current === optimisticMessage.id) {
        setSessionId(payload.session.id);
        setMessages(dedupeMessages(payload.messages));
        setRecommendation(payload.recommendation);
        setUsage(payload.usage);
      }

      return payload;
    } catch {
      setError("Unable to process the chat turn.");
      setRecommendation(null);
      setMessages((currentMessages) =>
        currentMessages.filter(
          (m) => m.id !== optimisticMessage.id && m.id !== streamingPlaceholder.id,
        ),
      );

      return null;
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
    }
  }

  return {
    error,
    hasHistory,
    loading,
    messages,
    recommendation,
    sendMessage,
    sessionId,
    usage,
  };
}
