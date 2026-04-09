import "server-only";

import Stripe from "stripe";

import { BILLING_WEBHOOK_RELEVANT_EVENTS } from "@/features/billing/constants";
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
  const userId = subscription.metadata.userId || subscription.metadata.supabaseUserId;
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

    if (session.subscription) {
      const stripe = new Stripe(getStripeServerConfig().secretKey);
      let subscription = await stripe.subscriptions.retrieve(String(session.subscription));

      if (session.metadata?.userId && !subscription.metadata.userId) {
        subscription = await stripe.subscriptions.update(subscription.id, {
          metadata: {
            ...subscription.metadata,
            userId: session.metadata.userId,
          },
        });
      }

      await upsertSubscriptionFromStripeSubscription(subscription);

      const distinctId = session.metadata?.userId ?? subscription.metadata.userId ?? session.client_reference_id;

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

    // If no userId yet, re-fetch from Stripe in case checkout handler already set it
    if (!subscription.metadata.userId && !subscription.metadata.supabaseUserId) {
      const stripe = new Stripe(getStripeServerConfig().secretKey);
      const fresh = await stripe.subscriptions.retrieve(subscription.id);
      if (fresh.metadata.userId || fresh.metadata.supabaseUserId) {
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