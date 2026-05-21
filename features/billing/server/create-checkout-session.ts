import "server-only";

import Stripe from "stripe";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { ANALYTICS_EVENTS, trackServerEvent } from "@/lib/analytics/track";
import { getStripePublicConfig, getStripeServerConfig } from "@/lib/stripe/config";
import {
  BILLING_DEFAULT_CURRENCY,
  BILLING_PLUS_PLAN,
  BILLING_PRO_PLAN,
} from "@/features/billing/constants";
import {
  STRIPE_CUSTOMER_METADATA_KEYS,
  STRIPE_METADATA_KEYS,
} from "@/features/billing/stripe-metadata";
import type {
  BillingPlan,
  CheckoutSession,
  CheckoutSessionInput,
} from "@/features/billing/types";

function resolvePriceIdForPlan(
  plan: BillingPlan,
  config: ReturnType<typeof getStripeServerConfig>,
): string {
  // TODO(flavia-pro): wire a real Stripe price ID for Pro once Flavia
  // confirms pricing. Until STRIPE_PRO_PRICE_ID is set, Pro checkout is
  // intentionally blocked here so users can't accidentally start a
  // subscription against the wrong product.
  if (plan === BILLING_PLUS_PLAN) {
    return config.flaviaPlusPriceId;
  }

  if (plan === BILLING_PRO_PLAN) {
    if (!config.flaviaProPriceId) {
      throw new Error(
        "Flavia Pro is not yet available for checkout. Set STRIPE_PRO_PRICE_ID once pricing is confirmed.",
      );
    }
    return config.flaviaProPriceId;
  }

  throw new Error(`No Stripe price configured for plan "${plan}".`);
}

export async function createCheckoutSession(
  input: CheckoutSessionInput,
): Promise<CheckoutSession> {
  const stripeConfig = getStripeServerConfig();
  const publicStripeConfig = getStripePublicConfig();
  const supabase = createAdminSupabaseClient();
  const stripe = new Stripe(stripeConfig.secretKey);
  const priceId = resolvePriceIdForPlan(input.plan, stripeConfig);

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
        // Customer-level lookup key — see STRIPE_CUSTOMER_METADATA_KEYS
        // docs. Stripe does NOT propagate this to subscriptions.
        [STRIPE_CUSTOMER_METADATA_KEYS.supabaseUserId]: input.userId,
      },
    });

    customerId = customer.id;
  }

  await supabase.from("subscriptions").upsert(
    {
      user_id: input.userId,
      plan_slug: input.plan,
      status: "inactive",
      stripe_customer_id: customerId,
    },
    { onConflict: "user_id" },
  );

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: input.successUrl || `${publicStripeConfig.appUrl}/account?checkout=success`,
    cancel_url: input.cancelUrl || `${publicStripeConfig.appUrl}/plans?checkout=cancelled`,
    client_reference_id: input.userId,
    metadata: {
      [STRIPE_METADATA_KEYS.userId]: input.userId,
      // INFORMATIONAL ONLY — webhook does not read this; plan is
      // derived from priceId. See stripe-metadata.ts for the full
      // rationale.
      [STRIPE_METADATA_KEYS.plan]: input.plan,
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