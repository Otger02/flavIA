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
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  };
}