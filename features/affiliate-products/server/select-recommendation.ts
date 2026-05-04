import "server-only";

import {
  getProductsByContext,
  getProductsByKeywords,
} from "@/features/affiliate-products/server/get-products";
import { getDismissedSlugsForSession } from "@/features/affiliate-products/server/track-recommendation-event";
import type { AffiliateProduct } from "@/features/affiliate-products/types";
import type { ProductContextDetection } from "@/features/affiliate-products/server/detect-product-context";

/**
 * Slim view of a product passed to the client + persisted on the
 * assistant message metadata. Strips internal fields like
 * commissionRate that should never reach the browser.
 */
export type AffiliateRecommendationCardData = {
  slug: string;
  title: string;
  brand: string;
  brandDisplayName: string;
  shortDescription: string;
  productImageUrl: string | null;
  affiliateUrl: string;
  priceRange: string | null;
};

function toCardData(product: AffiliateProduct): AffiliateRecommendationCardData {
  return {
    slug: product.slug,
    title: product.title,
    brand: product.brand,
    brandDisplayName: product.brandDisplayName,
    shortDescription: product.shortDescription,
    productImageUrl: product.productImageUrl,
    affiliateUrl: product.affiliateUrl,
    priceRange: product.priceRange,
  };
}

/**
 * Picks the single best product to recommend for this turn, or null.
 *
 * Order of operations:
 *   1. If detection.shouldRecommend is false → null (shouldn't be
 *      called at all in that case, but defended in depth).
 *   2. Query getProductsByContext — set-intersection match on tags,
 *      already sorted by match-count then priority.
 *   3. If no context match, fall back to getProductsByKeywords.
 *   4. Filter out products dismissed in this session.
 *   5. Return the first survivor (highest priority).
 *
 * Never throws — failure returns null.
 */
export async function selectAffiliateRecommendation(params: {
  detection: ProductContextDetection;
  sessionId: string;
}): Promise<AffiliateRecommendationCardData | null> {
  const { detection, sessionId } = params;

  if (!detection.shouldRecommend) {
    return null;
  }

  try {
    const [byContext, dismissed] = await Promise.all([
      getProductsByContext(detection.contextTags),
      getDismissedSlugsForSession(sessionId),
    ]);

    const filteredByContext = byContext.filter((p) => !dismissed.has(p.slug));
    if (filteredByContext.length > 0) {
      return toCardData(filteredByContext[0]);
    }

    if (detection.keywords.length === 0) {
      return null;
    }

    const byKeywords = await getProductsByKeywords(detection.keywords);
    const filteredByKeywords = byKeywords.filter((p) => !dismissed.has(p.slug));
    if (filteredByKeywords.length > 0) {
      return toCardData(filteredByKeywords[0]);
    }

    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.warn(`[affiliate-select] failed: ${message}`);
    return null;
  }
}
