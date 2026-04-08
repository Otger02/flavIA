import "server-only";

import Stripe from "stripe";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStripeServerConfig } from "@/lib/stripe/config";
import type {
  BillingPortalSession,
  BillingPortalSessionInput,
} from "@/features/billing/types";

export async function createBillingPortalSession(
  input: BillingPortalSessionInput,
): Promise<BillingPortalSession> {
  const supabase = await createServerSupabaseClient();
  const stripeConfig = getStripeServerConfig();
  const stripe = new Stripe(stripeConfig.secretKey);

  const { data, error } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load subscription for billing portal: ${error.message}`);
  }

  if (!data?.stripe_customer_id) {
    throw new Error("This user does not have a Stripe customer yet.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: input.returnUrl,
  });

  return {
    url: session.url,
  };
}