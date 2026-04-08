"use client";

import { useEffect, useRef } from "react";

import { type AnalyticsEventName, trackClientEvent } from "@/lib/analytics/track";

type TrackViewEventProps = {
  event: AnalyticsEventName;
  properties?: Record<string, unknown>;
};

export function TrackViewEvent({ event, properties = {} }: TrackViewEventProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    void trackClientEvent(event, properties);
  }, [event, properties]);

  return null;
}