import { z } from "zod";

import {
  BILLING_DEFAULT_CURRENCY,
  BILLING_FEATURE_KEYS,
  BILLING_FREE_PLAN,
  BILLING_PLUS_PLAN,
  BILLING_PRO_PLAN,
} from "@/features/billing/constants";

export const billingPlanSchema = z.enum([
  BILLING_FREE_PLAN,
  BILLING_PRO_PLAN,
  BILLING_PLUS_PLAN,
]);

export const billingFeatureKeySchema = z.enum([
  BILLING_FEATURE_KEYS.chatPriority,
  BILLING_FEATURE_KEYS.extendedLibrary,
  BILLING_FEATURE_KEYS.premiumRecommendations,
  BILLING_FEATURE_KEYS.communityCreateThread,
  BILLING_FEATURE_KEYS.communityUnlimitedPosts,
  BILLING_FEATURE_KEYS.communityInviteFlavia,
]);

export const userPlanSchema = z.object({
  userId: z.string(),
  plan: billingPlanSchema,
  status: z.enum(["inactive", "trialing", "active", "past_due", "canceled"]),
  stripeCustomerId: z.string().nullable(),
  stripeSubscriptionId: z.string().nullable(),
  currentPeriodEnd: z.string().nullable(),
});

export const checkoutSessionInputSchema = z.object({
  userId: z.string(),
  plan: billingPlanSchema,
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const checkoutSessionSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  plan: billingPlanSchema,
  currency: z.string().default(BILLING_DEFAULT_CURRENCY),
  customerId: z.string().nullable().optional(),
});

export const billingPortalSessionInputSchema = z.object({
  userId: z.string(),
  returnUrl: z.string().url(),
});

export const billingPortalSessionSchema = z.object({
  url: z.string().url(),
});

export const subscriptionSyncInputSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  payload: z.record(z.string(), z.unknown()),
  signature: z.string().optional(),
});

export const subscriptionSyncResultSchema = z.object({
  handled: z.boolean(),
  eventType: z.string(),
  subscriptionId: z.string().nullable(),
});

export const featureAccessSchema = z.object({
  allowed: z.boolean(),
  reason: z.string().nullable(),
  requiredPlan: billingPlanSchema.nullable(),
});

export type BillingPlan = z.infer<typeof billingPlanSchema>;
export type BillingFeatureKey = z.infer<typeof billingFeatureKeySchema>;
export type UserPlan = z.infer<typeof userPlanSchema>;
export type CheckoutSessionInput = z.infer<typeof checkoutSessionInputSchema>;
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>;
export type BillingPortalSessionInput = z.infer<typeof billingPortalSessionInputSchema>;
export type BillingPortalSession = z.infer<typeof billingPortalSessionSchema>;
export type SubscriptionSyncInput = z.infer<typeof subscriptionSyncInputSchema>;
export type SubscriptionSyncResult = z.infer<typeof subscriptionSyncResultSchema>;
export type FeatureAccess = z.infer<typeof featureAccessSchema>;