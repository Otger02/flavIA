/**
 * Single source of truth for the metadata keys we attach to Stripe
 * objects (checkout sessions, subscriptions, payment intents, customers).
 *
 * Why this file exists: before consolidation, each call site repeated
 * the literal string `"userId"` / `"bookSlug"` / etc. A typo on either
 * the writer or the reader would have been a silent runtime bug — the
 * key would just appear as `undefined` on the read side and downstream
 * logic would treat the user as unauthenticated, or skip the book
 * purchase, with no compile-time signal. Routing everything through
 * this constant means the keys are now type-checked against a single
 * declaration.
 *
 * Two scopes:
 *   1. STRIPE_METADATA_KEYS — keys we attach to checkout SESSIONS,
 *      SUBSCRIPTIONS, and PAYMENT INTENTS. These are session/payment
 *      scoped; the webhook reads them directly off the event object.
 *   2. STRIPE_CUSTOMER_METADATA_KEYS — keys we attach to the
 *      CUSTOMER object itself. Distinct scope: Stripe does NOT auto-
 *      propagate customer metadata to subscriptions/sessions, so the
 *      webhook never reads these. They exist only to make the
 *      Customer discoverable from the Stripe dashboard by Supabase
 *      user id.
 */

export const STRIPE_METADATA_KEYS = {
  /**
   * Supabase user id. Set on:
   *   - checkout.sessions.create.metadata
   *   - payment_intent_data.metadata (book one-time payments)
   *   - subscription.metadata (copied from session metadata after
   *     checkout.session.completed)
   *
   * Read by the webhook to resolve the row in `subscriptions` /
   * `book_purchases`. Always required for any persistence path.
   */
  userId: "userId",

  /**
   * Billing plan slug ("plus" | "pro"). Set on checkout.sessions.create.metadata.
   *
   * ⚠️  INFORMATIONAL ONLY — DO NOT TREAT AS THE SOURCE OF TRUTH.
   * ⚠️  The webhook does NOT read this field. Plan is derived
   *     authoritatively from the Stripe price id via
   *     `mapPriceIdToPlan(priceId)` in sync-subscription-from-stripe.ts.
   * ⚠️  This metadata exists only so a human searching the Stripe
   *     dashboard can find the session by plan name. If you find
   *     yourself wanting to read this in code, READ THE PRICE ID
   *     INSTEAD. They can drift (e.g. a price id swap during a plan
   *     migration) and the metadata is set once at checkout time —
   *     priceId is what Stripe actually billed against.
   */
  plan: "plan",

  /**
   * Discriminator for one-time payment checkouts. Value: BOOK_METADATA_KIND.
   * Set on book checkout session + book payment_intent_data.
   *
   * Read by the webhook (`session.metadata.kind === "book"`) to route
   * checkout.session.completed events between the subscription path
   * and the book-purchase path.
   */
  kind: "kind",

  /**
   * Book slug for book purchases. Set on book checkout session +
   * payment_intent_data. Read by the webhook to look up the book
   * row in Sanity and record the purchase in `book_purchases`.
   */
  bookSlug: "bookSlug",

  /**
   * Book price in COP (Colombian pesos) as a stringified integer.
   * Stripe metadata values must be strings — the webhook parses with
   * Number() and falls back to the canonical default.
   */
  amountCop: "amountCop",
} as const;

export type StripeMetadataKey = keyof typeof STRIPE_METADATA_KEYS;

export const STRIPE_CUSTOMER_METADATA_KEYS = {
  /**
   * Supabase user id attached to the Customer object at creation time.
   *
   * SCOPE NOTE: this is customer-level metadata, not session/subscription
   * metadata. Stripe does NOT auto-propagate it onto subscriptions or
   * sessions created later. The webhook reads userId from session/
   * subscription metadata, never from here.
   *
   * It exists for operator use: in the Stripe dashboard you can search
   * customers by `supabaseUserId:<uuid>` to find the Stripe customer
   * matching a Supabase user. Removing it would break that search but
   * not any code path.
   */
  supabaseUserId: "supabaseUserId",
} as const;

/**
 * Discriminator value for one-time book purchases. Lives next to
 * STRIPE_METADATA_KEYS so the writer and reader can't drift on either
 * the key OR the value.
 */
export const BOOK_METADATA_KIND = "book" as const;
