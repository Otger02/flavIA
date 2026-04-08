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

type UseChatResult = {
  error: string | null;
  loading: boolean;
  messages: ChatMessage[];
  hasHistory: boolean;
  recommendation: RecommendationCard | null;
  sendMessage: (text: string) => Promise<ChatTurnResponse | null>;
  sessionId: string | null;
  usage: ChatUsagePolicy | null;
};

function dedupeMessages(messages: ChatMessage[]): ChatMessage[] {
  const seen = new Set<string>();

  return messages.filter((message) => {
    if (seen.has(message.id)) {
      return false;
    }

    seen.add(message.id);
    return true;
  });
}

function shouldRetry(status: number, retryableFlag: unknown) {
  if (typeof retryableFlag === "boolean") {
    return retryableFlag;
  }

  return [408, 429, 500, 502, 503, 504].includes(status);
}

export function useChat({
  initialMessages = [],
  initialSessionId,
  initialUsage = null,
}: UseChatOptions = {}): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>(dedupeMessages(initialMessages));
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

    const optimisticMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: sessionId ?? "pending-session",
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    latestRequestIdRef.current = optimisticMessage.id;

    setMessages((currentMessages) => dedupeMessages([...currentMessages, optimisticMessage]));

    try {
      const requestBody = {
        message,
        clientMessageId: optimisticMessage.id,
        sessionId: sessionId ?? undefined,
      };

      const maxAttempts = 2;
      let lastErrorMessage = "Unable to process the chat turn.";

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const response = await fetch(CHAT_API_ROUTE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const fallbackMessage = "Unable to process the chat turn.";
          const responseBody = (await response.json().catch(() => null)) as
            | {
                error?: string;
                retryable?: boolean;
              }
            | null;

          const retryable = shouldRetry(response.status, responseBody?.retryable);
          lastErrorMessage = responseBody?.error ?? fallbackMessage;

          if (retryable && attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 450 * attempt));
            continue;
          }

          setError(lastErrorMessage);
          setRecommendation(null);
          setMessages((currentMessages) =>
            currentMessages.filter((messageItem) => messageItem.id !== optimisticMessage.id),
          );

          return null;
        }

        const payload = chatTurnResponseSchema.parse(await response.json());

        if (latestRequestIdRef.current !== optimisticMessage.id) {
          return payload;
        }

        setSessionId(payload.session.id);
        setMessages(dedupeMessages(payload.messages));
        setRecommendation(payload.recommendation);
        setUsage(payload.usage);

        return payload;
      }

      setError(lastErrorMessage);
      setRecommendation(null);
      setMessages((currentMessages) =>
        currentMessages.filter((messageItem) => messageItem.id !== optimisticMessage.id),
      );

      return null;
    } catch {
      setError("Unable to process the chat turn.");
      setRecommendation(null);
      setMessages((currentMessages) =>
        currentMessages.filter((messageItem) => messageItem.id !== optimisticMessage.id),
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