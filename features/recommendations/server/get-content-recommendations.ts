import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/db";
import type {
  ContentRecommendation,
  RecommendationRequest,
} from "@/features/recommendations/types";

type ContentItemRow = Database["public"]["Tables"]["content_items"]["Row"];
type ContentItemSelect = Pick<ContentItemRow, "id" | "title" | "excerpt" | "slug" | "priority">;

function mapContentItem(row: ContentItemSelect): ContentRecommendation {
  return {
    id: row.id,
    title: row.title,
    description: row.excerpt,
    href: `/content/${row.slug}`,
    score: row.priority ?? 0,
  };
}

export async function getContentRecommendations(
  request: RecommendationRequest,
): Promise<ContentRecommendation[]> {
  const supabase = await createServerSupabaseClient();
  const topicTag = typeof request.context.activeTopic === "string" ? request.context.activeTopic : null;

  let query = supabase
    .from("content_items")
    .select("id, title, excerpt, slug, priority, topic_tags")
    .order("priority", { ascending: false, nullsFirst: false })
    .limit(6);

  if (topicTag) {
    query = query.contains("topic_tags", [topicTag]);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Unable to load content recommendations: ${error.message}`);
  }

  return data.map(mapContentItem);
}
