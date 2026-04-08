import "server-only";

import {
  BILLING_FEATURE_KEYS,
  BILLING_FREE_PLAN,
  BILLING_PREMIUM_PLAN,
  BILLING_PRO_PLAN,
} from "@/features/billing/constants";
import type {
  BillingFeatureKey,
  FeatureAccess,
  UserPlan,
} from "@/features/billing/types";

type CanAccessFeatureParams = {
  feature: BillingFeatureKey;
  plan: UserPlan;
};

const requiredPlanByFeature: Record<BillingFeatureKey, UserPlan["plan"]> = {
  [BILLING_FEATURE_KEYS.chatPriority]: BILLING_PRO_PLAN,
  [BILLING_FEATURE_KEYS.extendedLibrary]: BILLING_PRO_PLAN,
  [BILLING_FEATURE_KEYS.premiumRecommendations]: BILLING_PREMIUM_PLAN,
};

export async function canAccessFeature({
  feature,
  plan,
}: CanAccessFeatureParams): Promise<FeatureAccess> {
  if (plan.plan !== BILLING_FREE_PLAN && plan.status !== "canceled") {
    return {
      allowed: true,
      reason: null,
      requiredPlan: null,
    };
  }

  const requiredPlan = requiredPlanByFeature[feature];
  const allowed =
    plan.plan === requiredPlan ||
    (requiredPlan === BILLING_PRO_PLAN && plan.plan === BILLING_PREMIUM_PLAN);

  return {
    allowed,
    reason: allowed ? null : "Current plan does not include this feature.",
    requiredPlan,
  };
}