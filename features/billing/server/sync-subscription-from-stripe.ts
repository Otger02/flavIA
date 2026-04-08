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
    return "pro" as const;
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
    throw new Error("Stripe subscription is missing userId metadata.");
  }

  const { error } = await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: mapPriceIdToPlan(priceId),
      status: mapStripeSubscriptionStatus(subscription.status),
      stripe_customer_id: customerId,
      stripe_price_id: priceId,
      stripe_subscription_id: subscription.id,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
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
      const subscription = await stripe.subscriptions.retrieve(String(session.subscription));

      if (session.metadata?.userId && !subscription.metadata.userId) {
        await stripe.subscriptions.update(subscription.id, {
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