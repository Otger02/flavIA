import { z } from "zod";

import {
  ONBOARDING_RELATIONSHIP_STATUSES,
  ONBOARDING_TOPICS,
  ONBOARDING_TOPIC_MAX,
} from "@/features/onboarding/constants";

/**
 * All fields optional. The flow can complete with everything empty
 * (the "Saltar" path) — the server action just stamps
 * onboarding_completed_at and returns.
 */
export const onboardingPayloadSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .nullable()
    .transform((value) => value ?? null),
  topics: z
    .array(z.enum(ONBOARDING_TOPICS))
    .max(ONBOARDING_TOPIC_MAX)
    .optional()
    .default([]),
  relationshipStatus: z
    .enum(ONBOARDING_RELATIONSHIP_STATUSES)
    .optional()
    .nullable()
    .transform((value) => value ?? null),
  /**
   * True when the user clicked "Saltar" from screen 1 or 2. The server
   * still marks the flow as complete but leaves all preference fields
   * blank — preserves whatever the user already had on profile.
   */
  skipped: z.boolean().optional().default(false),
});

export type OnboardingPayload = z.infer<typeof onboardingPayloadSchema>;
