import { getServerEnv } from "@/lib/env";

export function getSanityConfig() {
  const env = getServerEnv();

  return {
    projectId: env.SANITY_PROJECT_ID,
    dataset: env.SANITY_DATASET,
    apiVersion: env.SANITY_API_VERSION,
    useCdn: process.env.NODE_ENV === "production",
  };
}