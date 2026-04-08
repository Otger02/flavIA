import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import type { UserPlan } from "@/features/billing/types";
import type { Database } from "@/types/db";

type GetUserPlanParams = {
  userId: string;
};

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

function mapSubscriptionToUserPlan(row: SubscriptionRow): UserPlan {
  return {
    userId: row.user_id,
    plan: row.plan,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    stripePriceId: row.stripe_price_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    currentPeriodEnd: row.current_period_end,
  };
}

export async function getUserPlan({ userId }: GetUserPlanParams): Promise<UserPlan> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "user_id, plan, status, stripe_customer_id, stripe_price_id, stripe_subscription_id, current_period_end, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load user plan: ${error.message}`);
  }

  if (data) {
    return mapSubscriptionToUserPlan(data);
  }

  return {
    userId,
    plan: BILLING_FREE_PLAN,
    status: "inactive",
    stripeCustomerId: null,
    stripePriceId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
  };
}