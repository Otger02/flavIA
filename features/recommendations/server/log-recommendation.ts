import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  RecommendationClickInput,
  RecommendationLogInput,
  RecommendationLogResult,
} from "@/features/recommendations/types";

export async function logRecommendation(
  input: RecommendationLogInput,
): Promise<RecommendationLogResult> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("recommendation_logs")
    .insert({
      user_id: input.userId,
      session_id: input.sessionId,
      item_type: input.itemType,
      item_id: input.itemId,
      active_topic: input.activeTopic,
    })
    .select("id, created_at")
    .single();

  if (error) {
    throw new Error(`Unable to log recommendation impression: ${error.message}`);
  }

  return {
    logged: true,
    logId: data.id,
    loggedAt: data.created_at,
  };
}

export async function markRecommendationClick(
  input: RecommendationClickInput,
): Promise<RecommendationLogResult> {
  const supabase = await createServerSupabaseClient();
  const clickedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("recommendation_logs")
    .update({ clicked_at: clickedAt })
    .eq("id", input.logId)
    .is("clicked_at", null)
    .select("id, created_at, clicked_at")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to log recommendation click: ${error.message}`);
  }

  return {
    logged: Boolean(data),
    logId: data?.id ?? input.logId,
    loggedAt: data?.created_at ?? clickedAt,
    clickedAt: data?.clicked_at ?? clickedAt,
  };
}