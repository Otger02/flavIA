import "server-only";

import { BILLING_FEATURE_KEYS } from "@/features/billing/constants";
import { canAccessFeature } from "@/features/billing/server/can-access-feature";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FREE_STORIES_PER_WEEK, FREE_REPLIES_PER_DAY } from "@/features/community/constants";
import type { CommunityUsagePolicy } from "@/features/community/types";

type PolicyAction = "create_story" | "create_reply" | "create_thread";

export async function enforceCommunityPolicy({
  userId,
  action,
}: {
  userId: string;
  action: PolicyAction;
}): Promise<CommunityUsagePolicy> {
  const plan = await getUserPlan({ userId });

  // Thread creation is Plus-only
  if (action === "create_thread") {
    const access = await canAccessFeature({
      feature: BILLING_FEATURE_KEYS.communityCreateThread,
      plan,
    });
    return {
      allowed: access.allowed,
      reason: access.allowed ? null : "Crear conversaciones es exclusivo de Flavia Plus.",
      remainingCount: null,
    };
  }

  // Check if user has unlimited posting (Plus)
  const unlimitedAccess = await canAccessFeature({
    feature: BILLING_FEATURE_KEYS.communityUnlimitedPosts,
    plan,
  });

  if (unlimitedAccess.allowed) {
    return { allowed: true, reason: null, remainingCount: null };
  }

  // Free user — enforce rate limits
  const supabase = await createServerSupabaseClient();

  if (action === "create_story") {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from("user_stories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneWeekAgo);

    if (error) throw new Error(`Failed to check story usage: ${error.message}`);

    const used = count ?? 0;
    const remaining = Math.max(FREE_STORIES_PER_WEEK - used, 0);

    return {
      allowed: remaining > 0,
      reason: remaining > 0 ? null : "Has alcanzado el limite de 1 historia por semana. Actualiza a Plus para publicar sin limites.",
      remainingCount: remaining,
    };
  }

  if (action === "create_reply") {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from("community_comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString());

    if (error) throw new Error(`Failed to check reply usage: ${error.message}`);

    const used = count ?? 0;
    const remaining = Math.max(FREE_REPLIES_PER_DAY - used, 0);

    return {
      allowed: remaining > 0,
      reason: remaining > 0 ? null : "Has alcanzado el limite de 3 respuestas por dia. Actualiza a Plus para responder sin limites.",
      remainingCount: remaining,
    };
  }

  return { allowed: true, reason: null, remainingCount: null };
}
