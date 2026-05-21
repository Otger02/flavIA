"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  onboardingPayloadSchema,
  type OnboardingPayload,
} from "@/features/onboarding/types";

type Result = { ok: true } | { ok: false; error: string };

/**
 * Server action invoked by the onboarding form (or the "Saltar" button).
 *
 * Always marks `onboarding_completed=true` + stamps
 * `onboarding_completed_at=now()`. Only writes the optional fields
 * when the payload has non-empty values — that way a user who skips
 * doesn't wipe pre-existing profile data.
 */
export async function saveOnboarding(
  rawInput: unknown,
): Promise<Result> {
  const parsed = onboardingPayloadSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, error: "invalid_payload" };
  }
  const input: OnboardingPayload = parsed.data;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "unauthorized" };
  }

  // Build a partial update — every field is opt-in.
  const update: Record<string, unknown> = {
    onboarding_completed: true,
    onboarding_completed_at: new Date().toISOString(),
  };

  if (!input.skipped) {
    if (input.displayName !== null && input.displayName.length > 0) {
      update.display_name = input.displayName;
    }
    if (input.topics.length > 0) {
      update.onboarding_topics = input.topics;
    }
    if (input.relationshipStatus !== null) {
      update.relationship_status = input.relationshipStatus;
    }
  }

  const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Used by /account "Volver a hacer onboarding". Clears both the
 * boolean + timestamp so the auth callback (and any guard that reads
 * these) sends the user back through the flow.
 */
export async function resetOnboarding(): Promise<Result> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "unauthorized" };
  }
  const { error } = await supabase
    .from("profiles")
    .update({
      onboarding_completed: false,
      onboarding_completed_at: null,
    })
    .eq("id", user.id);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
