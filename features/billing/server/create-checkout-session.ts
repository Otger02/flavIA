import "server-only";

import Stripe from "stripe";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ANALYTICS_EVENTS, trackServerEvent } from "@/lib/analytics/track";
import { getStripePublicConfig, getStripeServerConfig } from "@/lib/stripe/config";
import { BILLING_DEFAULT_CURRENCY } from "@/features/billing/constants";
import type {
  CheckoutSession,
  CheckoutSessionInput,
} from "@/features/billing/types";

export async function createCheckoutSession(
  input: CheckoutSessionInput,
): Promise<CheckoutSession> {
  const stripeConfig = getStripeServerConfig();
  const publicStripeConfig = getStripePublicConfig();
  const supabase = createAdminSupabaseClient();
  const stripe = new Stripe(stripeConfig.secretKey);

  const { data: existingSubscription, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (subscriptionError) {
    throw new Error(`Unable to load customer for checkout: ${subscriptionError.message}`);
  }

  let customerId = existingSubscription?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        supabaseUserId: input.userId,
      },
    });

    customerId = customer.id;
  }

  await supabase.from("subscriptions").upsert(
    {
      user_id: input.userId,
      plan: input.plan,
      status: "inactive",
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: stripeConfig.flaviaPlusPriceId,
        quantity: 1,
      },
    ],
    success_url: input.successUrl || `${publicStripeConfig.appUrl}/account?checkout=success`,
    cancel_url: input.cancelUrl || `${publicStripeConfig.appUrl}/plans?checkout=cancelled`,
    client_reference_id: input.userId,
    metadata: {
      userId: input.userId,
      plan: input.plan,
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  await trackServerEvent({
    distinctId: input.userId,
    event: ANALYTICS_EVENTS.checkoutStarted,
    properties: {
      plan: input.plan,
      checkoutSessionId: session.id,
      customerId,
    },
  }).catch(() => null);

  return {
    id: session.id,
    url: session.url,
    plan: input.plan,
    currency: BILLING_DEFAULT_CURRENCY,
    customerId,
  };
}