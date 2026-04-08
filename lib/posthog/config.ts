import { getPublicEnv } from "@/lib/env";

export function getPostHogConfig() {
  const env = getPublicEnv();

  if (!env.NEXT_PUBLIC_POSTHOG_KEY || !env.NEXT_PUBLIC_POSTHOG_HOST) {
    return null;
  }

  return {
    apiKey: env.NEXT_PUBLIC_POSTHOG_KEY,
    apiHost: env.NEXT_PUBLIC_POSTHOG_HOST,
  };
}