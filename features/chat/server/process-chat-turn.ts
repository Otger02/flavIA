import "server-only";

import { buildChatContext } from "@/features/chat/server/build-chat-context";
import { createChatSession } from "@/features/chat/server/create-chat-session";
import { detectActiveTopic } from "@/features/chat/server/detect-active-topic";
import { enforceUsagePolicy } from "@/features/chat/server/enforce-usage-policy";
import { getChatHistory } from "@/features/chat/server/get-chat-history";
import { CHAT_MAX_INPUT_LENGTH } from "@/features/chat/constants";
import { logChatFailureMetric } from "@/features/chat/server/log-chat-failure-metric";
import { saveChatMessage } from "@/features/chat/server/save-chat-message";
import { updateUserState } from "@/features/chat/server/update-user-state";
import { chooseRecommendation } from "@/features/recommendations/server/choose-recommendation";
import { getContentRecommendations } from "@/features/recommendations/server/get-content-recommendations";
import { getProductRecommendations } from "@/features/recommendations/server/get-product-recommendations";
import { logRecommendation } from "@/features/recommendations/server/log-recommendation";
import { generateChatResponse } from "@/lib/ai/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatSession, ChatTurnRequest, ChatTurnResponse } from "@/features/chat/types";

type ProcessChatTurnParams = {
  userId: string;
  input: ChatTurnRequest;
};

export class ChatTurnProcessingError extends Error {
  code: string;
  retryable: boolean;
  sessionId: string;
  statusCode: number;

  constructor({
    code,
    message,
    retryable,
    sessionId,
    statusCode,
  }: {
    code: string;
    message: string;
    retryable: boolean;
    sessionId: string;
    statusCode: number;
  }) {
    super(message);
    this.name = "ChatTurnProcessingError";
    this.code = code;
    this.retryable = retryable;
    this.sessionId = sessionId;
    this.statusCode = statusCode;
  }
}

function sanitizeIncomingMessage(message: string) {
  const sanitizedMessage = message
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  if (!sanitizedMessage) {
    throw new Error("Chat message is empty after sanitization.");
  }

  if (sanitizedMessage.length > CHAT_MAX_INPUT_LENGTH) {
    throw new Error(`Chat message exceeds ${CHAT_MAX_INPUT_LENGTH} characters.`);
  }

  return sanitizedMessage;
}

function classifyChatError(errorMessage: string) {
  if (
    errorMessage.includes("empty after sanitization") ||
    errorMessage.includes("exceeds") ||
    errorMessage.includes("usage policy blocked")
  ) {
    return {
      code: "validation_error",
      retryable: false,
      statusCode: 400,
    };
  }

  if (errorMessage.includes("Unable to save chat message") || errorMessage.includes("Unable to load chat history")) {
    return {
      code: "persistence_error",
      retryable: true,
      statusCode: 503,
    };
  }

  if (errorMessage.includes("Unable to update active topic")) {
    return {
      code: "topic_update_error",
      retryable: true,
      statusCode: 503,
    };
  }

  return {
    code: "chat_turn_failed",
    retryable: true,
    statusCode: 500,
  };
}

function buildUpgradeReply(sessionId: string) {
  return {
    id: `paywall-${crypto.randomUUID()}`,
    sessionId,
    role: "assistant" as const,
    content:
      "Podemos seguir con esto, porque aqui es donde se pone interesante. Si quieres, seguimos paso a paso.",
    createdAt: new Date().toISOString(),
  };
}

function buildTurnThreeOrFourValueLine(activeTopic: ChatSession["activeTopic"]) {
  switch (activeTopic) {
    case "communication":
      return "Hay una forma de decir esto sin atacar. Si quieres, te doy una estructura sencilla.";
    case "couple_connection":
      return "Podemos bajar esto a una forma concreta de acercarte sin entrar a la defensiva.";
    case "desire":
      return "Tambien podemos llevar esto a una forma simple de hablar del deseo sin presion.";
    case "body_confidence":
      return "Si quieres, lo aterrizamos en una frase concreta para hablar de esto sin vergüenza.";
    default:
      return "Si quieres, lo bajamos a un siguiente paso concreto y facil de decir.";
  }
}

function buildRecommendationBridge(kind: "content" | "product") {
  if (kind === "content") {
    return "He visto algo que puede ayudarte mucho justo en este punto.";
  }

  return "Puede ayudarte tener un apoyo mas guiado para seguir paso a paso desde aqui.";
}

function buildHumanRecommendationRationale(kind: "content" | "product", activeTopic: ChatSession["activeTopic"]) {
  if (kind === "content") {
    switch (activeTopic) {
      case "communication":
        return "Te puede servir para ordenar lo que quieres decir antes de hablarlo.";
      case "couple_connection":
        return "Encaja con este momento porque te ayuda a reconectar sin forzar la conversacion.";
      case "desire":
        return "Puede ayudarte a hablar de deseo con mas claridad y menos tension.";
      default:
        return "Puede ayudarte a avanzar con mas claridad en este punto.";
    }
  }

  return "Puede ser un buen siguiente paso si quieres acompañamiento mas guiado desde aqui.";
}

function enrichAssistantReply({
  activeTopic,
  recommendationKind,
  reply,
  userTurnCount,
}: {
  activeTopic: ChatSession["activeTopic"];
  recommendationKind: "content" | "product" | null;
  reply: string;
  userTurnCount: number;
}) {
  const trimmedReply = reply.trim();

  if (userTurnCount >= 3 && userTurnCount <= 4) {
    return `${trimmedReply}\n\n${buildTurnThreeOrFourValueLine(activeTopic)}`;
  }

  if ((userTurnCount === 5 || userTurnCount === 6) && recommendationKind) {
    return `${trimmedReply}\n\n${buildRecommendationBridge(recommendationKind)}`;
  }

  return trimmedReply;
}

async function persistActiveTopic(session: ChatSession, userId: string, activeTopic: ChatSession["activeTopic"]) {
  if (!activeTopic || activeTopic === session.activeTopic) {
    return session;
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("chat_sessions")
    .update({ active_topic: activeTopic })
    .eq("id", session.id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Unable to update active topic: ${error.message}`);
  }

  return {
    ...session,
    activeTopic,
    updatedAt: new Date().toISOString(),
  };
}

export async function processChatTurn({
  userId,
  input,
}: ProcessChatTurnParams): Promise<ChatTurnResponse> {
  const session = await createChatSession({ userId, sessionId: input.sessionId });
  const sanitizedMessage = sanitizeIncomingMessage(input.message);

  try {
    const usage = await enforceUsagePolicy({ userId, sessionId: session.id });

    if (!usage.allowed && !usage.requiresUpgrade) {
      throw new Error(usage.reason ?? "Chat usage policy blocked this request.");
    }

    const historyBeforeTurn = await getChatHistory({ sessionId: session.id });

    if (usage.requiresUpgrade) {
      const paywallReply = buildUpgradeReply(session.id);

      return {
        session,
        reply: paywallReply,
        messages: [...historyBeforeTurn, paywallReply],
        recommendation: null,
        usage,
      };
    }

    await saveChatMessage({
      sessionId: session.id,
      userId,
      role: "user",
      content: sanitizedMessage,
      metadata: input.clientMessageId ? { clientMessageId: input.clientMessageId } : undefined,
    });

    const history = await getChatHistory({ sessionId: session.id });
    const detectedTopic = await detectActiveTopic({ recentMessages: history }).catch(() => null);
    const sessionWithTopic = await persistActiveTopic(session, userId, detectedTopic ?? session.activeTopic);

    const context = await buildChatContext({
      session: sessionWithTopic,
      history,
    });
    const userTurnCount = history.filter((message) => message.role === "user").length;

    const generatedReply = await generateChatResponse(context).catch(() => ({
      content:
        "Estoy teniendo un problema temporal para responder con normalidad. Intenta de nuevo en unos segundos.",
      model: "fallback",
      provider: "openai" as const,
    }));

    const recommendationRequest = {
      userId,
      surface: "chat" as const,
      context: {
        activeTopic: context.activeTopic,
      },
    };

    const [contentRecommendations, productRecommendations] = await Promise.all([
      getContentRecommendations(recommendationRequest),
      getProductRecommendations(recommendationRequest),
    ]);

    const recommendationChoice = await chooseRecommendation({
      content: contentRecommendations,
      products: productRecommendations,
      turnCount:
        userTurnCount === 5 ? 3 : userTurnCount === 6 ? 5 : userTurnCount,
    });

    let recommendation = recommendationChoice?.recommendation ?? null;
    const finalReplyContent = enrichAssistantReply({
      activeTopic: context.activeTopic,
      recommendationKind: recommendation?.kind ?? null,
      reply: generatedReply.content,
      userTurnCount,
    });

    const reply = await saveChatMessage({
      sessionId: session.id,
      userId,
      role: "assistant",
      content: finalReplyContent,
    });

    if (recommendationChoice && recommendation) {
      const logResult = await logRecommendation({
        userId,
        sessionId: session.id,
        surface: "chat",
        itemId: recommendationChoice.targetId,
        itemType: recommendationChoice.targetType,
        activeTopic: context.activeTopic,
        score: recommendation.score,
      }).catch(() => null);

      recommendation = {
        ...recommendation,
        logId: logResult?.logId ?? null,
        rationale: buildHumanRecommendationRationale(recommendation.kind, context.activeTopic),
      };
    }

    const messages = await getChatHistory({ sessionId: session.id });

    await updateUserState({
      session: sessionWithTopic,
      assistantMessage: reply,
    });

    return {
      session: sessionWithTopic,
      reply,
      messages,
      recommendation,
      usage,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unexpected chat processing error.";
    const classified = classifyChatError(errorMessage);

    await logChatFailureMetric({
      sessionId: session.id,
      userId,
      errorCode: classified.code,
      errorMessage,
    });

    throw new ChatTurnProcessingError({
      code: classified.code,
      message: errorMessage,
      retryable: classified.retryable,
      sessionId: session.id,
      statusCode: classified.statusCode,
    });
  }
}