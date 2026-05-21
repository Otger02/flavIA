"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type CompleteOnboardingInput = {
  displayName: string;
  relationshipStatus: string;
  pronouns: string;
};

export async function completeOnboarding({ displayName, relationshipStatus, pronouns }: CompleteOnboardingInput) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName.trim() || null,
      relationship_status: relationshipStatus || null,
      pronouns: pronouns || null,
      onboarding_completed: true,
      // Stamp the new timestamp column too so /onboarding's "already
      // done" check stays consistent regardless of which legacy
      // caller writes the boolean.
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return { error: error?.message ?? null };
}
