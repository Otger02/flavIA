import { getPublicEnv, getServerEnv } from "@/lib/env";

export function getStripePublicConfig() {
  const env = getPublicEnv();

  return {
    appUrl: env.NEXT_PUBLIC_APP_URL,
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };
}

export function getStripeServerConfig() {
  const env = getServerEnv();

  return {
    flaviaPlusPriceId: env.STRIPE_FLAVIA_PLUS_PRICE_ID,
    // TODO(flavia-pro): wire a real Stripe price ID once Flavia confirms
    // Pro pricing. Until then, attempting Pro checkout throws server-side.
    flaviaProPriceId: env.STRIPE_PRO_PRICE_ID,
    // TODO(flavia-books): wire a real Stripe price ID for the 30k COP
    // book product once Flavia confirms. Until then, book checkout throws
    // server-side and the /libros buy button renders as "Próximamente".
    bookPrice30kId: env.STRIPE_BOOK_PRICE_30K,
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET ?? "",
  };
}

export function isBookCheckoutEnabled(): boolean {
  return Boolean(getStripeServerConfig().bookPrice30kId);
}