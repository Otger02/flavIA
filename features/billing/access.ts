/**
 * Tier-hierarchy helpers for plan-based gating.
 *
 * Hierarchy (from least to most access):
 *   free  →  plus  →  pro
 *
 * `canAccessPlus` returns true for both `plus` and `pro` users with an
 * active/trialing subscription. `canAccessPro` is strict — only `pro` users
 * with an active/trialing subscription get true.
 *
 * These helpers are intentionally synchronous and decoupled from the more
 * granular feature-key gating in `server/can-access-feature.ts` (which
 * remains the source of truth for feature-by-feature checks). Use these
 * when you only need a tier check.
 */

import {
  BILLING_FREE_PLAN,
  BILLING_PLUS_PLAN,
  BILLING_PRO_PLAN,
} from "@/features/billing/constants";
import type { UserPlan } from "@/features/billing/types";

const ENTITLED_STATUSES: ReadonlyArray<UserPlan["status"]> = [
  "active",
  "trialing",
  // `past_due` is intentionally NOT entitled — Stripe will retry, but the
  // grace period is a billing-portal concern, not a feature-access one.
];

function isEntitled(plan: UserPlan | null | undefined): boolean {
  if (!plan) return false;
  if (plan.plan === BILLING_FREE_PLAN) return false;
  return ENTITLED_STATUSES.includes(plan.status);
}

export function canAccessPlus(plan: UserPlan | null | undefined): boolean {
  if (!isEntitled(plan)) return false;
  return plan!.plan === BILLING_PLUS_PLAN || plan!.plan === BILLING_PRO_PLAN;
}

export function canAccessPro(plan: UserPlan | null | undefined): boolean {
  if (!isEntitled(plan)) return false;
  return plan!.plan === BILLING_PRO_PLAN;
}
