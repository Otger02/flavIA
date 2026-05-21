import "server-only";

import {
  selectAffiliateRecommendation,
  type AffiliateRecommendationCardData,
} from "@/features/affiliate-products/server/select-recommendation";
import { detectProductContext } from "@/features/affiliate-products/server/detect-product-context";
import { chooseRecommendation } from "@/features/recommendations/server/choose-recommendation";
import { getContentRecommendations } from "@/features/recommendations/server/get-content-recommendations";
import { getProductRecommendations } from "@/features/recommendations/server/get-product-recommendations";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatMessage, ChatSession } from "@/features/chat/types";
import type { RecommendationCard, RecommendationChoice } from "@/features/recommendations/types";

export type AffiliateRecommendationResult = {
  card: AffiliateRecommendationCardData;
  contextTags: string[];
  keywords: string[];
  confidence: "low" | "medium" | "high";
};

async function detectAndSelectAffiliateRecommendation(params: {
  userMessage: string;
  recentMessages: ChatMessage[];
  userTurnCount: number;
  sessionId: string;
}): Promise<AffiliateRecommendationResult | null> {
  try {
    const detection = await detectProductContext({
      userMessage: params.userMessage,
      recentMessages: params.recentMessages,
      turnCount: params.userTurnCount,
    });

    if (!detection.shouldRecommend) {
      return null;
    }

    const card = await selectAffiliateRecommendation({
      detection,
      sessionId: params.sessionId,
    });

    if (!card) {
      return null;
    }

    return {
      card,
      contextTags: detection.contextTags,
      keywords: detection.keywords,
      confidence: detection.confidence,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.warn(`[affiliate-recommend] pipeline failed: ${message}`);
    return null;
  }
}

export type ChosenRecommendation = RecommendationChoice & { recommendation: RecommendationCard };

export type RecommendationPipelineResult = {
  recommendation: RecommendationCard | null;
  recommendationChoice: ChosenRecommendation | null;
  affiliateRecommendation: AffiliateRecommendationResult | null;
};

export type RunRecommendationPipelineParams = {
  userId: string;
  sessionId: string;
  activeTopic: ChatSession["activeTopic"];
  userMessage: string;
  recentMessages: ChatMessage[];
  userTurnCount: number;
};

/**
 * Shared post-LLM recommendation pipeline used by both buffered
 * (`processChatTurn`) and streaming (`processChatTurnStream`) entry points.
 *
 * Steps:
 *   1. Count previous recommendations + locate last-recommendation turn.
 *   2. Fetch content + product + affiliate recommendations in parallel.
 *   3. Run `chooseRecommendation` to select the legacy library card.
 *   4. Apply the priority gate: an affiliate hit suppresses the legacy
 *      library card so only one card renders per turn.
 *
 * Side-effects (`logRecommendation`, `recordRecommendationEvent`,
 * `saveChatMessage`, stream events) stay inline in each entry point —
 * their ordering genuinely diverges between buffered and streaming.
 */
export async function runRecommendationPipeline({
  userId,
  sessionId,
  activeTopic,
  userMessage,
  recentMessages,
  userTurnCount,
}: RunRecommendationPipelineParams): Promise<RecommendationPipelineResult> {
  const supabase = await createServerSupabaseClient();

  const { count: previousRecommendationCount } = await (supabase as any)
    .from("recommendation_log")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId);

  const { data: lastRecLog } = (await (supabase as any)
    .from("recommendation_log")
    .select("created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()) as { data: { created_at: string } | null };

  let lastRecommendationTurn = 0;
  if (lastRecLog) {
    const { count: turnsBeforeLastRec } = await supabase
      .from("chat_messages")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("role", "user")
      .lte("created_at", lastRecLog.created_at);
    lastRecommendationTurn = turnsBeforeLastRec ?? 0;
  }

  const recommendationRequest = {
    userId,
    surface: "chat" as const,
    context: { activeTopic },
  };

  const [contentRecommendations, productRecommendations, affiliateRecommendation] =
    await Promise.all([
      getContentRecommendations(recommendationRequest),
      getProductRecommendations(recommendationRequest),
      detectAndSelectAffiliateRecommendation({
        userMessage,
        recentMessages,
        userTurnCount,
        sessionId,
      }),
    ]);

  const recommendationChoice = await chooseRecommendation({
    content: contentRecommendations,
    products: productRecommendations,
    turnCount: userTurnCount,
    previousRecommendationCount: previousRecommendationCount ?? 0,
    lastRecommendationTurn,
  });

  let recommendation: RecommendationCard | null = recommendationChoice?.recommendation ?? null;

  // Priority gate: when an affiliate product fires on the same turn,
  // suppress the legacy library-content recommendation. Only one
  // recommendation card renders per turn — the affiliate one wins.
  if (affiliateRecommendation && recommendation) {
    recommendation = null;
  }

  return {
    recommendation,
    recommendationChoice,
    affiliateRecommendation,
  };
}
