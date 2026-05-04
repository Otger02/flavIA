import { NextResponse, type NextRequest } from "next/server";

import { syncSubscriptionFromStripe } from "@/features/billing/server/sync-subscription-from-stripe";
import { sendPurchaseConfirmationEmail } from "@/lib/email/send-purchase-confirmation";
import { getStripeServerConfig } from "@/lib/stripe/config";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripeConfig = getStripeServerConfig();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const payload = await request.text();
  const stripe = new Stripe(stripeConfig.secretKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, stripeConfig.webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  const result = await syncSubscriptionFromStripe({
    eventId: event.id,
    eventType: event.type,
    payload: event as unknown as Record<string, unknown>,
    signature,
  });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email ?? session.customer_email;
    if (email) {
      void sendPurchaseConfirmationEmail({ to: email, planName: "Flavia Plus" });
    }
  }

  return NextResponse.json(result, { status: 200 });
}