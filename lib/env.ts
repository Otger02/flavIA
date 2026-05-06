import { z } from "zod";

const emptyStringToUndefined = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmedValue = value.trim();
    return trimmedValue === "" ? undefined : trimmedValue;
  }, schema.optional());

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_POSTHOG_KEY: emptyStringToUndefined(z.string().min(1)),
  NEXT_PUBLIC_POSTHOG_HOST: emptyStringToUndefined(z.url()),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: emptyStringToUndefined(z.string().min(1)),
  STRIPE_FLAVIA_PLUS_PRICE_ID: z.string().min(1),
  // TODO(flavia-pro): Pro tier price not finalized yet. Optional until
  // Flavia confirms pricing — checkout for plan="pro" throws a clear error
  // when this isn't set. Replace with a real Stripe price ID then.
  STRIPE_PRO_PRICE_ID: emptyStringToUndefined(z.string().min(1)),
  // TODO(flavia-books): Book Stripe price not yet created. Single 30k COP
  // price reused across all books for now. Optional until Flavia confirms
  // — book checkout throws a clear error when this isn't set, and the buy
  // button on /libros/[slug] renders a "Próximamente" disabled state.
  STRIPE_BOOK_PRICE_30K: emptyStringToUndefined(z.string().min(1)),
  // Meta (Facebook + Instagram) OAuth. All optional until the Meta app
  // is configured. With these unset, the OAuth start route returns a
  // clear error and the admin page renders a "configure first" state.
  META_APP_ID: emptyStringToUndefined(z.string().min(1)),
  META_APP_SECRET: emptyStringToUndefined(z.string().min(1)),
  META_REDIRECT_URI: emptyStringToUndefined(z.url()),
  // HMAC signing secret used to protect the OAuth `state` parameter
  // and (later, in phase 3) one-click email action tokens. Optional in
  // dev so the app boots; required for any flow that signs/verifies.
  INTEGRATIONS_SIGNING_SECRET: emptyStringToUndefined(z.string().min(32)),
  SANITY_PROJECT_ID: z.string().min(1),
  SANITY_DATASET: z.string().min(1),
  SANITY_API_VERSION: z.iso.date(),
  OPENAI_API_KEY: emptyStringToUndefined(z.string().min(1)),
  ANTHROPIC_API_KEY: emptyStringToUndefined(z.string().min(1)),
  RESEND_API_KEY: emptyStringToUndefined(z.string().min(1)),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Server environment variables cannot be accessed on the client.");
  }
}

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export function getServerEnv(): ServerEnv {
  assertServerOnly();

  return serverEnvSchema.parse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_FLAVIA_PLUS_PRICE_ID: process.env.STRIPE_FLAVIA_PLUS_PRICE_ID,
    STRIPE_PRO_PRICE_ID: process.env.STRIPE_PRO_PRICE_ID,
    STRIPE_BOOK_PRICE_30K: process.env.STRIPE_BOOK_PRICE_30K,
    META_APP_ID: process.env.META_APP_ID,
    META_APP_SECRET: process.env.META_APP_SECRET,
    META_REDIRECT_URI: process.env.META_REDIRECT_URI,
    INTEGRATIONS_SIGNING_SECRET: process.env.INTEGRATIONS_SIGNING_SECRET,
    SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
    SANITY_DATASET: process.env.SANITY_DATASET,
    SANITY_API_VERSION: process.env.SANITY_API_VERSION,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  });
}

export function getAiProviderKeys() {
  assertServerOnly();

  const openAiApiKey = process.env.OPENAI_API_KEY?.trim() || undefined;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim() || undefined;

  return { openAiApiKey, anthropicApiKey };
}