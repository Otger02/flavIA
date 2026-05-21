import "server-only";

import { recordRecommendationEvent } from "@/features/affiliate-products/server/track-recommendation-event";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import { buildChatContext } from "@/features/chat/server/build-chat-context";
import { createChatSession } from "@/features/chat/server/create-chat-session";
import { detectActiveTopic } from "@/features/chat/server/detect-active-topic";
import { enforceUsagePolicy } from "@/features/chat/server/enforce-usage-policy";
import { getChatHistory } from "@/features/chat/server/get-chat-history";
import { CHAT_MAX_INPUT_LENGTH } from "@/features/chat/constants";
import { logChatFailureMetric } from "@/features/chat/server/log-chat-failure-metric";
import { runRecommendationPipeline } from "@/features/chat/server/process-chat-turn-shared";
import { saveChatMessage } from "@/features/chat/server/save-chat-message";
import { updateUserState } from "@/features/chat/server/update-user-state";
import { logRecommendation } from "@/features/recommendations/server/log-recommendation";
import { generateChatResponse, generateChatResponseStream } from "@/lib/ai/client";
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
      "Justo aquí es donde la conversación se pone buena. Si quieres seguir, con Flavia Plus no hay límite — seguimos al ritmo que necesites.",
    createdAt: new Date().toISOString(),
  };
}

function buildTurnThreeOrFourValueLine(activeTopic: ChatSession["activeTopic"]) {
  switch (activeTopic) {
    case "communication":
      return "Hay una forma de decir esto sin que suene a ataque. Si quieres, te doy una frase con la que podrías empezar.";
    case "couple_connection":
      return "Esto lo podemos bajar a algo concreto: una forma de acercarte que no active la defensa del otro.";
    case "desire":
      return "Si te parece, lo llevamos a una forma simple de hablar de deseo sin que nadie se sienta presionado.";
    case "body_confidence":
      return "Podemos aterrizarlo en algo concreto: una forma de hablarte a ti misma sobre esto sin vergüenza.";
    default:
      return "Si quieres, lo bajamos a un siguiente paso concreto. Algo que puedas decir o hacer ya.";
  }
}

function buildRecommendationBridge(kind: "content" | "product") {
  if (kind === "content") {
    return "Tengo algo que encaja justo con lo que estamos hablando. Creo que te puede servir.";
  }

  return "Si sientes que quieres ir más profundo con esto, hay una forma de que sigamos sin prisa.";
}

function buildHumanRecommendationRationale(kind: "content" | "product", activeTopic: ChatSession["activeTopic"]) {
  if (kind === "content") {
    switch (activeTopic) {
      case "communication":
        return "Te puede servir para ordenar lo que quieres decir antes de abrir la conversación.";
      case "couple_connection":
        return "Va con lo que estás viviendo: ayuda a reconectar sin forzar nada.";
      case "desire":
        return "Habla de deseo con la calma que necesitas ahora mismo.";
      default:
        return "Creo que te da claridad justo en lo que estamos trabajando.";
    }
  }

  return "Si quieres acompañamiento más guiado, esto puede ser un buen siguiente paso.";
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
  };
}

export async function processChatTurn({
  userId,
  input,
}: ProcessChatTurnParams): Promise<ChatTurnResponse> {
  const session = await createChatSession({ userId, sessionId: input.sessionId });
  const sanitizedMessage = sanitizeIncomingMessage(input.message);

  try {
    // Single getUserPlan call per turn — threaded through both the usage
    // policy and the chat-context builder. Was: 2 calls (one inside
    // enforceUsagePolicy, one here for isPlusUser).
    const userPlan = await getUserPlan({ userId });

    const usage = await enforceUsagePolicy({ userId, sessionId: session.id, plan: userPlan });

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
        affiliateRecommendation: null,
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
      plan: userPlan,
    });
    const userTurnCount = history.filter((message) => message.role === "user").length;

    const generatedReply = await generateChatResponse(context).catch((error) => {
      console.error("[chat] generateChatResponse threw:", error);
      return {
        content:
          "Estoy teniendo un problema temporal para responder con normalidad. Intenta de nuevo en unos segundos.",
        model: "fallback",
        provider: "openai" as const,
      };
    });

    const recommendationRequest = {
      userId,
      surface: "chat" as const,
      context: {
        activeTopic: context.activeTopic,
      },
    };

    const {
      recommendation: gatedRecommendation,
      recommendationChoice,
      affiliateRecommendation,
    } = await runRecommendationPipeline({
      userId,
      sessionId: session.id,
      activeTopic: context.activeTopic,
      userMessage: sanitizedMessage,
      recentMessages: history,
      userTurnCount,
    });

    let recommendation = gatedRecommendation;

    // logRecommendation runs after the pipeline. The legacy log row
    // records what was *chosen*, not what was *displayed* — so it stays
    // tied to recommendationChoice even when the priority gate
    // suppressed the rendered card in favor of an affiliate hit.
    const recommendationLogResult =
      recommendationChoice && recommendationChoice.recommendation
        ? await logRecommendation({
            userId,
            sessionId: session.id,
            surface: "chat",
            itemId: recommendationChoice.targetId,
            itemType: recommendationChoice.targetType,
            activeTopic: context.activeTopic,
            score: recommendationChoice.recommendation.score,
          }).catch(() => null)
        : null;

    // Enrichment runs AFTER the gate so the assistant's message text
    // doesn't lead into a library recommendation that won't appear.
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
      metadata: affiliateRecommendation
        ? { affiliateRecommendation: affiliateRecommendation.card }
        : undefined,
    });

    if (recommendationChoice && recommendation) {
      recommendation = {
        ...recommendation,
        logId: recommendationLogResult?.logId ?? null,
        rationale: buildHumanRecommendationRationale(recommendation.kind, context.activeTopic),
      };
    }

    if (affiliateRecommendation) {
      void recordRecommendationEvent({
        userId,
        sessionId: session.id,
        productSlug: affiliateRecommendation.card.slug,
        eventType: "shown",
        metadata: {
          contextTags: affiliateRecommendation.contextTags,
          keywords: affiliateRecommendation.keywords,
          confidence: affiliateRecommendation.confidence,
        },
      });
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
      affiliateRecommendation: affiliateRecommendation?.card ?? null,
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

// --- Streaming variant ---

export async function processChatTurnStream({
  userId,
  input,
}: ProcessChatTurnParams): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  function encodeEvent(data: Record<string, unknown>) {
    return encoder.encode(JSON.stringify(data) + "\n");
  }

  const session = await createChatSession({ userId, sessionId: input.sessionId });
  const sanitizedMessage = sanitizeIncomingMessage(input.message);
  // Single getUserPlan call per streaming turn — threaded through usage
  // policy and chat context.
  const userPlan = await getUserPlan({ userId });
  const usage = await enforceUsagePolicy({ userId, sessionId: session.id, plan: userPlan });

  // If paywall, return a single "done" event — no streaming needed
  if (usage.requiresUpgrade) {
    const historyBeforeTurn = await getChatHistory({ sessionId: session.id });
    const paywallReply = buildUpgradeReply(session.id);

    return new ReadableStream({
      start(controller) {
        controller.enqueue(
          encodeEvent({
            type: "done",
            session,
            reply: paywallReply,
            messages: [...historyBeforeTurn, paywallReply],
            recommendation: null,
            affiliateRecommendation: null,
            usage,
          }),
        );
        controller.close();
      },
    });
  }

  if (!usage.allowed) {
    throw new ChatTurnProcessingError({
      code: "validation_error",
      message: usage.reason ?? "Chat usage policy blocked this request.",
      retryable: false,
      sessionId: session.id,
      statusCode: 400,
    });
  }

  // Pre-LLM work
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

  const context = await buildChatContext({ session: sessionWithTopic, history, plan: userPlan });
  const userTurnCount = history.filter((m) => m.role === "user").length;

  // Get the stream
  const { stream: tokenStream, model, provider } = await generateChatResponseStream(context);

  return new ReadableStream({
    async start(controller) {
      let fullContent = "";

      try {
        for await (const token of tokenStream) {
          fullContent += token;
          controller.enqueue(encodeEvent({ type: "token", content: token }));
        }

        // ── Post-LLM work ─────────────────────────────────────────────
        // The user has already seen Flavia's full reply by this point.
        // The shared pipeline runs the affiliate detection in parallel
        // with the legacy content + product fetches and never blocks
        // the main token stream.
        const {
          recommendation: gatedRecommendation,
          recommendationChoice,
          affiliateRecommendation,
        } = await runRecommendationPipeline({
          userId,
          sessionId: session.id,
          activeTopic: context.activeTopic,
          userMessage: sanitizedMessage,
          recentMessages: history,
          userTurnCount,
        });

        let recommendation = gatedRecommendation;

        const finalReplyContent = enrichAssistantReply({
          activeTopic: context.activeTopic,
          recommendationKind: recommendation?.kind ?? null,
          reply: fullContent,
          userTurnCount,
        });

        const reply = await saveChatMessage({
          sessionId: session.id,
          userId,
          role: "assistant",
          content: finalReplyContent,
          metadata: affiliateRecommendation
            ? { affiliateRecommendation: affiliateRecommendation.card }
            : undefined,
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

        if (affiliateRecommendation) {
          // Emit a dedicated stream event so clients that want to
          // attach the card optimistically (before `done`) can do so.
          controller.enqueue(
            encodeEvent({
              type: "affiliate_recommendation",
              product: affiliateRecommendation.card,
            }),
          );

          void recordRecommendationEvent({
            userId,
            sessionId: session.id,
            productSlug: affiliateRecommendation.card.slug,
            eventType: "shown",
            metadata: {
              contextTags: affiliateRecommendation.contextTags,
              keywords: affiliateRecommendation.keywords,
              confidence: affiliateRecommendation.confidence,
            },
          });
        }

        // Send enrichment suffix separately if the enriched content has more than the raw LLM output
        const enrichmentSuffix = finalReplyContent.slice(fullContent.length);
        if (enrichmentSuffix) {
          controller.enqueue(encodeEvent({ type: "token", content: enrichmentSuffix }));
        }

        const messages = await getChatHistory({ sessionId: session.id });

        await updateUserState({ session: sessionWithTopic, assistantMessage: reply });

        controller.enqueue(
          encodeEvent({
            type: "done",
            session: sessionWithTopic,
            reply,
            messages,
            recommendation,
            affiliateRecommendation: affiliateRecommendation?.card ?? null,
            usage,
          }),
        );
      } catch (error) {
        console.error("[chat-stream] Error during streaming:", error);
        controller.enqueue(
          encodeEvent({
            type: "error",
            message: error instanceof Error ? error.message : "Streaming error",
          }),
        );
      } finally {
        controller.close();
      }
    },
  });
}