import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";

type RecommendationLogRow = Database["public"]["Tables"]["recommendation_logs"]["Row"];
type ContentItemRow = Database["public"]["Tables"]["content_items"]["Row"];
type ProductItemRow = Database["public"]["Tables"]["product_items"]["Row"];

export type ClickedRecommendation = {
  id: string;
  title: string;
  type: RecommendationLogRow["item_type"];
  clickedAt: string;
};

type GetClickedRecommendationsParams = {
  limit?: number;
  userId: string;
};

export async function getClickedRecommendations({
  limit = 5,
  userId,
}: GetClickedRecommendationsParams): Promise<ClickedRecommendation[]> {
  const supabase = await createServerSupabaseClient();

  const { data: logs, error: logsError } = await supabase
    .from("recommendation_logs")
    .select("id, item_id, item_type, clicked_at")
    .eq("user_id", userId)
    .not("clicked_at", "is", null)
    .order("clicked_at", { ascending: false })
    .limit(limit);

  if (logsError) {
    throw new Error(`Unable to load clicked recommendations: ${logsError.message}`);
  }

  if (!logs || logs.length === 0) {
    return [];
  }

  const contentIds = logs.filter((log) => log.item_type === "content").map((log) => log.item_id);
  const productIds = logs.filter((log) => log.item_type === "product").map((log) => log.item_id);

  const [contentResult, productResult] = await Promise.all([
    contentIds.length > 0
      ? supabase.from("content_items").select("id, title").in("id", contentIds)
      : Promise.resolve({ data: [] as Pick<ContentItemRow, "id" | "title">[], error: null }),
    productIds.length > 0
      ? supabase.from("product_items").select("id, name").in("id", productIds)
      : Promise.resolve({ data: [] as Pick<ProductItemRow, "id" | "name">[], error: null }),
  ]);

  if (contentResult.error) {
    throw new Error(`Unable to load clicked content titles: ${contentResult.error.message}`);
  }

  if (productResult.error) {
    throw new Error(`Unable to load clicked product titles: ${productResult.error.message}`);
  }

  const contentTitleById = new Map(contentResult.data.map((item) => [item.id, item.title]));
  const productTitleById = new Map(productResult.data.map((item) => [item.id, item.name]));

  return logs.flatMap((log) => {
    const title = log.item_type === "content" ? contentTitleById.get(log.item_id) : productTitleById.get(log.item_id);

    if (!title || !log.clicked_at) {
      return [];
    }

    return [
      {
        id: log.id,
        title,
        type: log.item_type,
        clickedAt: log.clicked_at,
      },
    ];
  });
}