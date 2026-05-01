import "server-only";

import {
  FREE_SESSION_MESSAGE_LIMIT,
  PLUS_SESSION_MESSAGE_LIMIT,
} from "@/features/billing/constants";
import { canAccessPlus, canAccessPro } from "@/features/billing/access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UserPlan } from "@/features/billing/types";
import type { ChatUsagePolicy } from "@/features/chat/types";

type EnforceUsagePolicyParams = {
  userId: string;
  sessionId?: string;
  // Caller-provided to avoid a duplicate getUserPlan round-trip per turn.
  // The plan is fetched once at the orchestrator (processChatTurn /
  // processChatTurnStream / chat page render) and threaded through.
  plan: UserPlan;
};

export async function enforceUsagePolicy({
  userId,
  sessionId,
  plan,
}: EnforceUsagePolicyParams): Promise<ChatUsagePolicy> {
  // Pro: unlimited chat, no enforcement.
  if (canAccessPro(plan)) {
    return {
      allowed: true,
      requiresUpgrade: false,
      requires_upgrade: false,
      reason: null,
      remainingTurns: null,
    };
  }

  // Plus: 100 messages per session, soft-cap (no upgrade prompt — Pro is
  // optional). Free: 4 messages per session, then paywall to Plus.
  const isPlus = canAccessPlus(plan);
  const sessionLimit = isPlus
    ? PLUS_SESSION_MESSAGE_LIMIT
    : FREE_SESSION_MESSAGE_LIMIT;

  if (!sessionId) {
    return {
      allowed: true,
      requiresUpgrade: false,
      requires_upgrade: false,
      reason: null,
      remainingTurns: sessionLimit,
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
  const remainingTurns = Math.max(sessionLimit - usedMessages, 0);
  const overLimit = usedMessages >= sessionLimit;

  // Only free users see the paywall — Plus users hitting their session
  // cap get a soft block (allowed=false) without an upgrade prompt.
  const requiresUpgrade = overLimit && !isPlus;

  return {
    allowed: !overLimit,
    requiresUpgrade,
    requires_upgrade: requiresUpgrade,
    reason: overLimit
      ? isPlus
        ? "Has llegado al limite de mensajes de esta sesion. Empieza una nueva."
        : "Has llegado al limite gratuito de esta sesion."
      : null,
    remainingTurns,
  };
}