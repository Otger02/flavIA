import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

// ──────────────────────────────────────────────────────────────────────────────
// Module mocks (must be declared before dynamic imports)
// ──────────────────────────────────────────────────────────────────────────────

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));
const mockAdminClient = { from: mockFrom };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: () => mockAdminClient,
}));

vi.mock("@/lib/stripe/config", () => ({
  getStripeServerConfig: () => ({
    secretKey: "sk_test_fake",
    webhookSecret: "whsec_fake",
    flaviaPlusPriceId: "price_plus_test",
  }),
}));

vi.mock("@/lib/analytics/track", () => ({
  ANALYTICS_EVENTS: { checkoutCompleted: "checkout_completed" },
  trackServerEvent: vi.fn().mockResolvedValue(undefined),
}));

const mockRecordBookPurchase = vi.fn().mockResolvedValue(undefined);
vi.mock("@/features/books/server/book-purchases", () => ({
  recordBookPurchase: (...args: unknown[]) => mockRecordBookPurchase(...args),
}));

// Stripe constructor mock — only used for subscription retrieval paths
const mockSubscriptionsRetrieve = vi.fn();
const mockSubscriptionsUpdate = vi.fn();
vi.mock("stripe", () => {
  function StripeMock() {
    return {
      subscriptions: {
        retrieve: mockSubscriptionsRetrieve,
        update: mockSubscriptionsUpdate,
      },
    };
  }
  return { default: StripeMock };
});

// ──────────────────────────────────────────────────────────────────────────────
// Helpers to build minimal Stripe-shaped payloads
// ──────────────────────────────────────────────────────────────────────────────

function makeSubscriptionPayload(overrides: Record<string, unknown> = {}) {
  return {
    data: {
      object: {
        id: "sub_test",
        status: "active",
        items: { data: [{ price: { id: "price_plus_test" } }] },
        customer: "cus_test",
        current_period_end: 1893456000,
        metadata: { userId: "user-123" },
        ...overrides,
      },
    },
  };
}

function makeCheckoutSessionPayload(overrides: Record<string, unknown> = {}, metaOverrides: Record<string, unknown> = {}) {
  return {
    data: {
      object: {
        id: "cs_test",
        mode: "subscription",
        subscription: "sub_test",
        customer_details: { email: "test@example.com" },
        metadata: { userId: "user-123", ...metaOverrides },
        client_reference_id: "user-123",
        ...overrides,
      },
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("syncSubscriptionFromStripe", () => {
  let syncSubscriptionFromStripe: typeof import("@/features/billing/server/sync-subscription-from-stripe").syncSubscriptionFromStripe;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
    // Default: retrieve returns a fully-formed subscription with userId
    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_test",
      status: "active",
      items: { data: [{ price: { id: "price_plus_test" } }] },
      customer: "cus_test",
      current_period_end: 1893456000,
      metadata: { userId: "user-123" },
    });
    mockSubscriptionsUpdate.mockResolvedValue({
      id: "sub_test",
      status: "active",
      items: { data: [{ price: { id: "price_plus_test" } }] },
      customer: "cus_test",
      current_period_end: 1893456000,
      metadata: { userId: "user-123" },
    });
    const mod = await import("@/features/billing/server/sync-subscription-from-stripe");
    syncSubscriptionFromStripe = mod.syncSubscriptionFromStripe;
  });

  // ── Irrelevant events ────────────────────────────────────────────────────
  it("returns handled:false for unrecognised event types", async () => {
    const result = await syncSubscriptionFromStripe({
      eventId: "evt_001",
      eventType: "payment_intent.created",
      payload: { data: { object: {} } },
      signature: "sig",
    });

    expect(result).toEqual({
      handled: false,
      eventType: "payment_intent.created",
      subscriptionId: null,
    });
    expect(mockFrom).not.toHaveBeenCalled();
  });

  // ── customer.subscription.updated ────────────────────────────────────────
  it("upserts subscription when userId present in metadata", async () => {
    const result = await syncSubscriptionFromStripe({
      eventId: "evt_002",
      eventType: "customer.subscription.updated",
      payload: makeSubscriptionPayload(),
      signature: "sig",
    });

    expect(result.handled).toBe(true);
    expect(result.subscriptionId).toBe("sub_test");
    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-123",
        plan_slug: "plus",
        status: "active",
        stripe_subscription_id: "sub_test",
      }),
      expect.objectContaining({ onConflict: "user_id" }),
    );
  });

  it("re-fetches subscription from Stripe when userId missing in metadata", async () => {
    const result = await syncSubscriptionFromStripe({
      eventId: "evt_003",
      eventType: "customer.subscription.updated",
      payload: makeSubscriptionPayload({ metadata: {} }),
      signature: "sig",
    });

    expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith("sub_test");
    expect(result.handled).toBe(true);
  });

  it("skips upsert and returns handled:true when re-fetched sub still has no userId", async () => {
    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_test",
      status: "active",
      items: { data: [{ price: { id: "price_plus_test" } }] },
      customer: "cus_test",
      current_period_end: 1893456000,
      metadata: {},
    });

    const result = await syncSubscriptionFromStripe({
      eventId: "evt_004",
      eventType: "customer.subscription.updated",
      payload: makeSubscriptionPayload({ metadata: {} }),
      signature: "sig",
    });

    expect(result.handled).toBe(true);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("maps stripe 'past_due' status correctly", async () => {
    await syncSubscriptionFromStripe({
      eventId: "evt_005",
      eventType: "customer.subscription.updated",
      payload: makeSubscriptionPayload({ status: "past_due" }),
      signature: "sig",
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "past_due" }),
      expect.anything(),
    );
  });

  it("maps stripe 'unpaid' status to 'canceled'", async () => {
    await syncSubscriptionFromStripe({
      eventId: "evt_006",
      eventType: "customer.subscription.updated",
      payload: makeSubscriptionPayload({ status: "unpaid" }),
      signature: "sig",
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "canceled" }),
      expect.anything(),
    );
  });

  it("maps unknown price ID to 'free' plan", async () => {
    await syncSubscriptionFromStripe({
      eventId: "evt_007",
      eventType: "customer.subscription.updated",
      payload: makeSubscriptionPayload({
        items: { data: [{ price: { id: "price_unknown" } }] },
      }),
      signature: "sig",
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ plan_slug: "free" }),
      expect.anything(),
    );
  });

  it("throws when Supabase upsert returns an error", async () => {
    mockUpsert.mockResolvedValue({ error: { message: "DB constraint violation" } });

    await expect(
      syncSubscriptionFromStripe({
        eventId: "evt_008",
        eventType: "customer.subscription.updated",
        payload: makeSubscriptionPayload(),
        signature: "sig",
      }),
    ).rejects.toThrow("Unable to upsert Stripe subscription");
  });

  // ── checkout.session.completed — subscription path ───────────────────────
  it("retrieves and upserts subscription on checkout.session.completed", async () => {
    const result = await syncSubscriptionFromStripe({
      eventId: "evt_009",
      eventType: "checkout.session.completed",
      payload: makeCheckoutSessionPayload(),
      signature: "sig",
    });

    expect(mockSubscriptionsRetrieve).toHaveBeenCalledWith("sub_test");
    expect(mockFrom).toHaveBeenCalledWith("subscriptions");
    expect(result.handled).toBe(true);
    expect(result.subscriptionId).toBe("sub_test");
  });

  it("propagates userId from session metadata to subscription when missing", async () => {
    mockSubscriptionsRetrieve.mockResolvedValue({
      id: "sub_test",
      status: "active",
      items: { data: [{ price: { id: "price_plus_test" } }] },
      customer: "cus_test",
      current_period_end: 1893456000,
      metadata: {},
    });

    await syncSubscriptionFromStripe({
      eventId: "evt_010",
      eventType: "checkout.session.completed",
      payload: makeCheckoutSessionPayload(),
      signature: "sig",
    });

    expect(mockSubscriptionsUpdate).toHaveBeenCalledWith(
      "sub_test",
      expect.objectContaining({
        metadata: expect.objectContaining({ userId: "user-123" }),
      }),
    );
  });

  // ── checkout.session.completed — book purchase path ──────────────────────
  it("calls recordBookPurchase for book payment sessions", async () => {
    const result = await syncSubscriptionFromStripe({
      eventId: "evt_011",
      eventType: "checkout.session.completed",
      payload: makeCheckoutSessionPayload(
        { mode: "payment", subscription: null },
        { kind: "book", bookSlug: "amor-propio", amountCop: "35000" },
      ),
      signature: "sig",
    });

    expect(mockRecordBookPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        bookSlug: "amor-propio",
        amountCop: 35000,
      }),
    );
    expect(mockFrom).not.toHaveBeenCalled();
    expect(result.handled).toBe(true);
  });

  it("skips book purchase when userId or bookSlug missing", async () => {
    const result = await syncSubscriptionFromStripe({
      eventId: "evt_012",
      eventType: "checkout.session.completed",
      payload: makeCheckoutSessionPayload(
        { mode: "payment", subscription: null },
        { kind: "book" }, // no bookSlug
      ),
      signature: "sig",
    });

    expect(mockRecordBookPurchase).not.toHaveBeenCalled();
    expect(result.handled).toBe(true);
  });

  // ── customer.subscription.deleted ────────────────────────────────────────
  it("handles customer.subscription.deleted event", async () => {
    const result = await syncSubscriptionFromStripe({
      eventId: "evt_013",
      eventType: "customer.subscription.deleted",
      payload: makeSubscriptionPayload({ status: "canceled" }),
      signature: "sig",
    });

    expect(result.handled).toBe(true);
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "canceled" }),
      expect.anything(),
    );
  });
});
