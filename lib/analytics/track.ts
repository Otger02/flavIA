import { createServerPostHog, getBrowserPostHog } from "@/lib/analytics/posthog";

export const ANALYTICS_EVENTS = {
  homeViewed: "home_viewed",
  chatOpened: "chat_opened",
  firstMessageSent: "first_message_sent",
  paywallHit: "paywall_hit",
  checkoutStarted: "checkout_started",
  checkoutCompleted: "checkout_completed",
  recommendationShown: "recommendation_shown",
  recommendationClicked: "recommendation_clicked",
  topicFeedbackSubmitted: "topic_feedback_submitted",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

type AnalyticsProperties = Record<string, unknown>;

type ServerTrackEventInput = {
  distinctId: string;
  event: AnalyticsEventName;
  properties?: AnalyticsProperties;
};

export async function trackClientEvent(
  event: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  const posthog = await getBrowserPostHog();

  if (!posthog) {
    return false;
  }

  posthog.capture(event, properties);
  return true;
}

export async function trackServerEvent({
  distinctId,
  event,
  properties = {},
}: ServerTrackEventInput) {
  const posthog = await createServerPostHog();

  if (!posthog) {
    return false;
  }

  try {
    await posthog.capture({
      distinctId,
      event,
      properties,
    });

    await posthog.shutdown();
    return true;
  } catch {
    await posthog.shutdown().catch(() => null);
    return false;
  }
}