import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type RecordEventInput = {
  userId: string | null;
  sessionId: string;
  productSlug: string;
  eventType: "shown" | "clicked" | "dismissed";
  metadata?: Record<string, unknown>;
};

/**
 * Server-side insert. Uses the admin client because:
 *   - 'shown' fires from the chat orchestrator, where the user may be
 *     anonymous (free tier) — RLS would reject inserts with NULL user_id.
 *   - 'clicked' / 'dismissed' fire from authenticated POST endpoints
 *     where RLS would also work, but we route through admin for
 *     consistency.
 *
 * Never throws — analytics failures must not break the chat flow.
 */
export async function recordRecommendationEvent(
  input: RecordEventInput,
): Promise<void> {
  try {
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("affiliate_recommendation_events").insert({
      user_id: input.userId,
      session_id: input.sessionId,
      product_slug: input.productSlug,
      event_type: input.eventType,
      metadata: input.metadata ?? {},
    });
    if (error) {
      console.warn(
        `[affiliate-events] insert failed (${input.eventType}/${input.productSlug}): ${error.message}`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.warn(`[affiliate-events] insert threw: ${message}`);
  }
}

/**
 * Returns the slugs the user has dismissed in THIS session. Used by the
 * selector to filter out dismissed products. Failure returns an empty
 * set — better to occasionally re-show a dismissed product than to skip
 * the recommendation entirely.
 */
export async function getDismissedSlugsForSession(
  sessionId: string,
): Promise<Set<string>> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("affiliate_recommendation_events")
      .select("product_slug")
      .eq("session_id", sessionId)
      .eq("event_type", "dismissed");

    if (error) {
      console.warn(`[affiliate-events] dismissed lookup failed: ${error.message}`);
      return new Set();
    }
    return new Set((data ?? []).map((row) => row.product_slug));
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.warn(`[affiliate-events] dismissed lookup threw: ${message}`);
    return new Set();
  }
}
