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
};

export async function chooseRecommendation({
  content,
  products,
  turnCount,
}: ChooseRecommendationParams): Promise<(RecommendationChoice & { recommendation: RecommendationCard }) | null> {
  if (turnCount === 3) {
    const topContent = content[0];

    if (!topContent) {
      return null;
    }

    return {
      targetId: topContent.id,
      targetType: "content",
      rationale: "Helpful content unlocked after the third turn.",
      recommendation: {
        id: topContent.id,
        kind: "content",
        title: topContent.title,
        description: topContent.description,
        href: topContent.href,
        logId: null,
        rationale: "Helpful content unlocked after the third turn.",
        score: topContent.score,
      },
    };
  }

  if (turnCount === 5) {
    const topProduct = products[0];

    if (!topProduct) {
      return null;
    }

    return {
      targetId: topProduct.id,
      targetType: "product",
      rationale: "Product suggestion unlocked after the fifth turn.",
      recommendation: {
        id: topProduct.id,
        kind: "product",
        title: topProduct.name,
        description: topProduct.description,
        href: topProduct.href,
        logId: null,
        rationale: "Product suggestion unlocked after the fifth turn.",
        score: topProduct.score,
        imageUrl: topProduct.imageUrl ?? null,
      },
    };
  }

  return null;
}