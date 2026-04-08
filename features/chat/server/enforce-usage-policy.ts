import "server-only";

import { BILLING_FEATURE_KEYS } from "@/features/billing/constants";
import { canAccessFeature } from "@/features/billing/server/can-access-feature";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ChatUsagePolicy } from "@/features/chat/types";

const FREE_SESSION_MESSAGE_LIMIT = 5;

type EnforceUsagePolicyParams = {
  userId: string;
  sessionId?: string;
};

export async function enforceUsagePolicy({
  userId,
  sessionId,
}: EnforceUsagePolicyParams): Promise<ChatUsagePolicy> {
  const plan = await getUserPlan({ userId });
  const featureAccess = await canAccessFeature({
    feature: BILLING_FEATURE_KEYS.chatPriority,
    plan,
  });

  if (featureAccess.allowed) {
    return {
      allowed: true,
      requiresUpgrade: false,
      requires_upgrade: false,
      reason: null,
      remainingTurns: null,
    };
  }

  if (!sessionId) {
    return {
      allowed: true,
      requiresUpgrade: false,
      requires_upgrade: false,
      reason: null,
      remainingTurns: FREE_SESSION_MESSAGE_LIMIT,
    };
  }

  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("session_id", sessionId)
    .eq("user_id", userId)
    .eq("role", "user");

  if (error) {
    throw new Error(`Unable to enforce chat usage policy: ${error.message}`);
  }

  const usedMessages = count ?? 0;
  const remainingTurns = Math.max(FREE_SESSION_MESSAGE_LIMIT - usedMessages, 0);
  const requiresUpgrade = usedMessages >= FREE_SESSION_MESSAGE_LIMIT;

  return {
    allowed: !requiresUpgrade,
    requiresUpgrade,
    requires_upgrade: requiresUpgrade,
    reason: requiresUpgrade ? "Has llegado al limite gratuito de esta sesion." : null,
    remainingTurns,
  };
}