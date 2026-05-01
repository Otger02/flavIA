export const BILLING_DEFAULT_CURRENCY = "eur";
export const BILLING_FREE_PLAN = "free";
export const BILLING_PRO_PLAN = "pro";
export const BILLING_PLUS_PLAN = "plus";
export const BILLING_PREMIUM_PLAN = "premium";
export const BILLING_PLUS_PRODUCT_NAME = "Flavia Plus";
export const BILLING_PRO_PRODUCT_NAME = "Flavia Pro";

// Per-session chat message limits. Pro is unlimited (no cap enforced).
export const FREE_SESSION_MESSAGE_LIMIT = 4;
export const PLUS_SESSION_MESSAGE_LIMIT = 100;

export const BILLING_FEATURE_KEYS = {
  chatPriority: "chat-priority",
  extendedLibrary: "extended-library",
  premiumRecommendations: "premium-recommendations",
  communityCreateThread: "community-create-thread",
  communityUnlimitedPosts: "community-unlimited-posts",
  communityInviteFlavia: "community-invite-flavia",
} as const;

export const BILLING_WEBHOOK_RELEVANT_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  // One-time book purchases reuse `checkout.session.completed` (the same
  // event covers subscription and payment modes — branched by mode).
  // No additional event types needed for now; refunds add `charge.refunded`
  // when we wire the refund handler.
] as const;