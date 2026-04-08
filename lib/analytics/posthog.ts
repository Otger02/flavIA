import { getPostHogConfig } from "@/lib/posthog/config";

declare global {
  interface Window {
    __flaviaPostHogInitialized?: boolean;
  }
}

export async function getBrowserPostHog() {
  if (typeof window === "undefined") {
    return null;
  }

  const config = getPostHogConfig();

  if (!config) {
    return null;
  }

  const posthog = (await import("posthog-js")).default;

  if (!window.__flaviaPostHogInitialized) {
    posthog.init(config.apiKey, {
      api_host: config.apiHost,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage",
    });

    window.__flaviaPostHogInitialized = true;
  }

  return posthog;
}

export async function createServerPostHog() {
  if (typeof window !== "undefined") {
    return null;
  }

  const config = getPostHogConfig();

  if (!config) {
    return null;
  }

  const { PostHog } = await import("posthog-node");

  return new PostHog(config.apiKey, {
    host: config.apiHost,
    flushAt: 1,
    flushInterval: 0,
  });
}