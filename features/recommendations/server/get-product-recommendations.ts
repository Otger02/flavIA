import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";
import type {
  ProductRecommendation,
  RecommendationRequest,
} from "@/features/recommendations/types";

type ProductItemRow = Database["public"]["Tables"]["product_items"]["Row"];

function mapProductItem(row: ProductItemRow): ProductRecommendation {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    href: row.href,
    score: row.score ?? 0,
  };
}

export async function getProductRecommendations(
  request: RecommendationRequest,
): Promise<ProductRecommendation[]> {
  const supabase = await createServerSupabaseClient();
  const topicTag = typeof request.context.activeTopic === "string" ? request.context.activeTopic : null;

  let query = supabase
    .from("product_items")
    .select("id, name, description, href, score, topic_tags")
    .order("score", { ascending: false, nullsFirst: false })
    .limit(4);

  if (topicTag) {
    query = query.contains("topic_tags", [topicTag]);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load product recommendations: ${error.message}`);
  }

  return data.map(mapProductItem);
}