import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";
import type {
  ProductRecommendation,
  RecommendationRequest,
} from "@/features/recommendations/types";

type ProductItemRow = Database["public"]["Tables"]["product_items"]["Row"];
type ProductItemSelect = Pick<ProductItemRow, "id" | "title" | "description" | "external_url" | "slug" | "priority">;

function mapProductItem(row: ProductItemSelect): ProductRecommendation {
  return {
    id: row.id,
    name: row.title,
    description: row.description,
    href: row.external_url ?? `/products/${row.slug}`,
    score: row.priority ?? 0,
  };
}

export async function getProductRecommendations(
  request: RecommendationRequest,
): Promise<ProductRecommendation[]> {
  const supabase = await createServerSupabaseClient();
  const topicTag = typeof request.context.activeTopic === "string" ? request.context.activeTopic : null;

  let query = supabase
    .from("product_items")
    .select("id, title, description, external_url, slug, priority, topic_tags")
    .order("priority", { ascending: false, nullsFirst: false })
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
