import "server-only";

import type {
  ContentRecommendation,
  ProductRecommendation,
  RecommendationCard,
  RecommendationChoice,
} from "@/features/recommendations/types";

type ChooseRecommendationParams = {
  content: ContentRecommendation[];
  products: ProductRecommendation[];
  turnCount: number;
  /** How many recommendations have already been shown this session */
  previousRecommendationCount?: number;
  /** Turn number of the last recommendation shown (0 = none) */
  lastRecommendationTurn?: number;
  /** Current topic relevance — higher score = better match */
  topicConfidence?: number;
};

/**
 * Smart recommendation chooser.
 *
 * Instead of hardcoded turns, uses heuristics:
 * - Minimum 3 user turns before ANY recommendation
 * - Never two recommendations in a row (at least 2 turns apart)
 * - Content recommendations first (educational), products later
 * - Products only after turn 5 and after at least one content rec
 * - Max 3 recommendations per session to avoid feeling spammy
 * - Higher-scoring items get priority; skip if best score is too low
 */
export async function chooseRecommendation({
  content,
  products,
  turnCount,
  previousRecommendationCount = 0,
  lastRecommendationTurn = 0,
  topicConfidence = 1,
}: ChooseRecommendationParams): Promise<(RecommendationChoice & { recommendation: RecommendationCard }) | null> {
  const MAX_RECOMMENDATIONS_PER_SESSION = 3;
  const MIN_TURNS_FOR_CONTENT = 3;
  const MIN_TURNS_FOR_PRODUCT = 5;
  const MIN_TURNS_BETWEEN_RECS = 2;
  const MIN_SCORE_THRESHOLD = 0.1;

  // Hard limits
  if (previousRecommendationCount >= MAX_RECOMMENDATIONS_PER_SESSION) {
    return null;
  }

  if (turnCount < MIN_TURNS_FOR_CONTENT) {
    return null;
  }

  // Don't recommend on consecutive turns
  if (lastRecommendationTurn > 0 && turnCount - lastRecommendationTurn < MIN_TURNS_BETWEEN_RECS) {
    return null;
  }

  // Sweet spots: turns where a recommendation feels natural
  // After turn 3 (user has shared enough), turn 5-6 (deeper engagement), turn 8+ (wrapping up)
  const isNaturalMoment =
    turnCount === MIN_TURNS_FOR_CONTENT ||
    turnCount === MIN_TURNS_FOR_PRODUCT ||
    turnCount === 6 ||
    (turnCount >= 8 && turnCount % 3 === 0);

  // Outside natural moments, only recommend if topic confidence is very high
  if (!isNaturalMoment && topicConfidence < 0.8) {
    return null;
  }

  // Decide: content or product?
  const canShowContent = content.length > 0 && content[0].score >= MIN_SCORE_THRESHOLD;
  const canShowProduct =
    turnCount >= MIN_TURNS_FOR_PRODUCT &&
    products.length > 0 &&
    products[0].score >= MIN_SCORE_THRESHOLD &&
    previousRecommendationCount >= 1; // show content first

  // Prefer content on earlier turns, product on later turns
  if (canShowProduct && turnCount >= MIN_TURNS_FOR_PRODUCT) {
    const topProduct = products[0];
    return {
      targetId: topProduct.id,
      targetType: "product",
      rationale: `Product suggestion — turn ${turnCount}, topic confidence ${topicConfidence.toFixed(2)}`,
      recommendation: {
        id: topProduct.id,
        kind: "product",
        title: topProduct.name,
        description: topProduct.description,
        href: topProduct.href,
        logId: null,
        rationale: `Product suggestion — turn ${turnCount}`,
        score: topProduct.score,
        imageUrl: topProduct.imageUrl ?? null,
      },
    };
  }

  if (canShowContent) {
    const topContent = content[0];
    return {
      targetId: topContent.id,
      targetType: "content",
      rationale: `Content recommendation — turn ${turnCount}, topic confidence ${topicConfidence.toFixed(2)}`,
      recommendation: {
        id: topContent.id,
        kind: "content",
        title: topContent.title,
        description: topContent.description,
        href: topContent.href,
        logId: null,
        rationale: `Content recommendation — turn ${turnCount}`,
        score: topContent.score,
      },
    };
  }

  return null;
}
