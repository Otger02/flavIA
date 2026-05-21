import "server-only";

import Stripe from "stripe";

import { BILLING_WEBHOOK_RELEVANT_EVENTS } from "@/features/billing/constants";
import {
  BOOK_METADATA_KIND,
  STRIPE_METADATA_KEYS,
} from "@/features/billing/stripe-metadata";
import { recordBookPurchase } from "@/features/books/server/book-purchases";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ANALYTICS_EVENTS, trackServerEvent } from "@/lib/analytics/track";
import { getStripeServerConfig } from "@/lib/stripe/config";
import type {
  SubscriptionSyncInput,
  SubscriptionSyncResult,
} from "@/features/billing/types";

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "inactive" | "trialing" | "active" | "past_due" | "canceled" {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "canceled";
    default:
      return "inactive";
  }
}

function mapPriceIdToPlan(priceId: string | null | undefined) {
  const { flaviaPlusPriceId } = getStripeServerConfig();

  if (priceId === flaviaPlusPriceId) {
    return "plus" as const;
  }

  return "free" as const;
}

async function upsertSubscriptionFromStripeSubscription(subscription: Stripe.Subscription) {
  const supabase = createAdminSupabaseClient();
  // Single canonical key. Previously this also tried
  // `subscription.metadata.supabaseUserId` as a fallback, but no
  // writer ever sets that key on subscriptions (it's a customer-level
  // key that Stripe does not auto-propagate). Dropped to avoid
  // implying a producer that doesn't exist.
  const userId = subscription.metadata[STRIPE_METADATA_KEYS.userId];
  const priceId = subscription.items.data[0]?.price.id ?? null;
  const currentPeriodEnd =
    "current_period_end" in subscription && typeof subscription.current_period_end === "number"
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null;

  if (!userId) {
    // subscription.created/updated events may fire before checkout.session.completed
    // copies the userId metadata — skip gracefully and let checkout handler sync it
    console.warn(`[billing] Skipping subscription ${subscription.id}: no userId in metadata yet.`);
    return;
  }

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan_slug: mapPriceIdToPlan(priceId),
      status: mapStripeSubscriptionStatus(subscription.status),
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      current_period_end: currentPeriodEnd,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Unable to upsert Stripe subscription: ${error.message}`);
  }
}

export async function syncSubscriptionFromStripe(
  input: SubscriptionSyncInput,
): Promise<SubscriptionSyncResult> {
  const handled = BILLING_WEBHOOK_RELEVANT_EVENTS.includes(
    input.eventType as (typeof BILLING_WEBHOOK_RELEVANT_EVENTS)[number],
  );

  if (!handled) {
    return {
      handled: false,
      eventType: input.eventType,
      subscriptionId: null,
    };
  }

  const eventPayload = input.payload as {
    data?: {
      object?: Stripe.Event.Data.Object;
    };
  };
  const eventObject = eventPayload.data?.object;

  if (!eventObject) {
    throw new Error("Stripe webhook payload does not include an event object.");
  }

  if (input.eventType === "checkout.session.completed") {
    const session = eventObject as Stripe.Checkout.Session;

    // Book purchases: mode='payment' with metadata.kind === 'book'.
    // Decoupled from the subscription path so a book sale never touches
    // the `subscriptions` table or affects a user's plan.
    if (
      session.mode === "payment" &&
      session.metadata?.[STRIPE_METADATA_KEYS.kind] === BOOK_METADATA_KIND
    ) {
      const userId =
        session.metadata[STRIPE_METADATA_KEYS.userId] ?? session.client_reference_id ?? null;
      const bookSlug = session.metadata[STRIPE_METADATA_KEYS.bookSlug] ?? null;
      const amountCop = Number(session.metadata[STRIPE_METADATA_KEYS.amountCop] ?? 0);

      if (!userId || !bookSlug) {
        console.error(
          `[books][webhook] Missing userId or bookSlug on session ${session.id}; skipping.`,
        );
        return {
          handled: true,
          eventType: input.eventType,
          subscriptionId: null,
        };
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      await recordBookPurchase({
        userId,
        bookSlug,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        amountCop: Number.isFinite(amountCop) && amountCop > 0 ? amountCop : 30000,
      });

      await trackServerEvent({
        distinctId: userId,
        event: ANALYTICS_EVENTS.checkoutCompleted,
        properties: {
          checkoutSessionId: session.id,
          kind: "book",
          bookSlug,
          amountCop,
        },
      }).catch(() => null);

      return {
        handled: true,
        eventType: input.eventType,
        subscriptionId: null,
      };
    }

    if (session.subscription) {
      const stripe = new Stripe(getStripeServerConfig().secretKey);
      let subscription = await stripe.subscriptions.retrieve(String(session.subscription));

      const sessionUserId = session.metadata?.[STRIPE_METADATA_KEYS.userId];
      if (sessionUserId && !subscription.metadata[STRIPE_METADATA_KEYS.userId]) {
        subscription = await stripe.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            [STRIPE_METADATA_KEYS.userId]: sessionUserId,
          },
        });
      }

      await upsertSubscriptionFromStripeSubscription(subscription);

      const distinctId =
        sessionUserId ??
        subscription.metadata[STRIPE_METADATA_KEYS.userId] ??
        session.client_reference_id;

      if (distinctId) {
        await trackServerEvent({
          distinctId,
          event: ANALYTICS_EVENTS.checkoutCompleted,
          properties: {
            checkoutSessionId: session.id,
            subscriptionId: subscription.id,
            plan: mapPriceIdToPlan(subscription.items.data[0]?.price.id ?? null),
            status: mapStripeSubscriptionStatus(subscription.status),
          },
        }).catch(() => null);
      }

      return {
        handled: true,
        eventType: input.eventType,
        subscriptionId: subscription.id,
      };
    }
  }

  if (
    input.eventType === "customer.subscription.created" ||
    input.eventType === "customer.subscription.updated" ||
    input.eventType === "customer.subscription.deleted"
  ) {
    const subscription = eventObject as Stripe.Subscription;

    // If no userId yet, re-fetch from Stripe in case checkout handler
    // already set it. Previously this also checked
    // `subscription.metadata.supabaseUserId` — dropped because that
    // key is customer-scoped (not propagated to subscriptions by
    // Stripe) so no real producer could have populated it here.
    if (!subscription.metadata[STRIPE_METADATA_KEYS.userId]) {
      const stripe = new Stripe(getStripeServerConfig().secretKey);
      const fresh = await stripe.subscriptions.retrieve(subscription.id);
      if (fresh.metadata[STRIPE_METADATA_KEYS.userId]) {
        await upsertSubscriptionFromStripeSubscription(fresh);
        return { handled: true, eventType: input.eventType, subscriptionId: fresh.id };
      }
      // Still no userId — skip, checkout.session.completed will handle it
      return { handled: true, eventType: input.eventType, subscriptionId: subscription.id };
    }

    await upsertSubscriptionFromStripeSubscription(subscription);

    return {
      handled: true,
      eventType: input.eventType,
      subscriptionId: subscription.id,
    };
  }

  return {
    handled: true,
    eventType: input.eventType,
    subscriptionId: null,
  };
}