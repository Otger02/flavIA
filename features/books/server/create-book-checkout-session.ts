import "server-only";

import Stripe from "stripe";

import { ANALYTICS_EVENTS, trackServerEvent } from "@/lib/analytics/track";
import { getStripePublicConfig, getStripeServerConfig } from "@/lib/stripe/config";
import { getBookBySlug } from "@/features/books/server/get-books";
import {
  BOOK_METADATA_KIND,
  STRIPE_METADATA_KEYS,
} from "@/features/billing/stripe-metadata";

type CreateBookCheckoutInput = {
  userId: string;
  slug: string;
  successUrl?: string;
  cancelUrl?: string;
};

type CreateBookCheckoutResult = {
  id: string;
  url: string;
  slug: string;
};

export async function createBookCheckoutSession(
  input: CreateBookCheckoutInput,
): Promise<CreateBookCheckoutResult> {
  const stripeConfig = getStripeServerConfig();
  const publicStripeConfig = getStripePublicConfig();

  // TODO(flavia-books): wire a real Stripe price ID for the 30k COP book
  // product once Flavia confirms. The env-level TBD is enforced here so
  // the buy button can render disabled in the UI without risking a
  // half-configured checkout.
  if (!stripeConfig.bookPrice30kId) {
    throw new Error(
      "Book checkout is not yet available. Set STRIPE_BOOK_PRICE_30K once the Stripe product is configured.",
    );
  }

  const book = await getBookBySlug(input.slug);
  if (!book) {
    throw new Error(`Book "${input.slug}" not found or not available.`);
  }

  const stripe = new Stripe(stripeConfig.secretKey);
  const origin = publicStripeConfig.appUrl.replace(/\/$/, "");
  const successUrl =
    input.successUrl ||
    `${origin}/libros/${book.slug}?purchased=true&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = input.cancelUrl || `${origin}/libros/${book.slug}?error=payment`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: stripeConfig.bookPrice30kId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: input.userId,
    payment_intent_data: {
      // Mirror the session metadata exactly. Webhook reads from
      // session.metadata, but keeping both bags symmetric avoids the
      // operator-confusing situation where the Stripe dashboard's
      // payment-intent view shows different fields than the
      // session view.
      metadata: {
        [STRIPE_METADATA_KEYS.userId]: input.userId,
        [STRIPE_METADATA_KEYS.bookSlug]: book.slug,
        [STRIPE_METADATA_KEYS.amountCop]: String(book.priceCop),
        [STRIPE_METADATA_KEYS.kind]: BOOK_METADATA_KIND,
      },
    },
    metadata: {
      [STRIPE_METADATA_KEYS.userId]: input.userId,
      [STRIPE_METADATA_KEYS.bookSlug]: book.slug,
      [STRIPE_METADATA_KEYS.amountCop]: String(book.priceCop),
      [STRIPE_METADATA_KEYS.kind]: BOOK_METADATA_KIND,
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL for the book purchase.");
  }

  await trackServerEvent({
    distinctId: input.userId,
    event: ANALYTICS_EVENTS.checkoutStarted,
    properties: {
      checkoutSessionId: session.id,
      kind: "book",
      bookSlug: book.slug,
    },
  }).catch(() => null);

  return {
    id: session.id,
    url: session.url,
    slug: book.slug,
  };
}
