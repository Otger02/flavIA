export const BILLING_DEFAULT_CURRENCY = "eur";
export const BILLING_FREE_PLAN = "free";
export const BILLING_PRO_PLAN = "pro";
export const BILLING_PREMIUM_PLAN = "premium";
export const BILLING_PLUS_PRODUCT_NAME = "Flavia Plus";

export const BILLING_FEATURE_KEYS = {
  chatPriority: "chat-priority",
  extendedLibrary: "extended-library",
  premiumRecommendations: "premium-recommendations",
} as const;

export const BILLING_WEBHOOK_RELEVANT_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
] as const;