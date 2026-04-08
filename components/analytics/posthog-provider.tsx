"use client";

import { useEffect } from "react";

import { getBrowserPostHog } from "@/lib/analytics/posthog";

export function PostHogProvider() {
  useEffect(() => {
    void getBrowserPostHog();
  }, []);

  return null;
}