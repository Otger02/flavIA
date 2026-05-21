import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { requireUser } from "@/features/auth/server/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ONBOARDING_RELATIONSHIP_STATUSES,
  ONBOARDING_TOPICS,
  type OnboardingRelationshipStatus,
  type OnboardingTopic,
} from "@/features/onboarding/constants";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    // Onboarding is private — keep it out of search engines.
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

/**
 * Onboarding shell. Server component:
 *   - Requires auth (any logged-in user)
 *   - Reads the user's profile to short-circuit if onboarding is done
 *   - Pre-populates the form with whatever profile data already exists
 *     (so a user who skipped earlier can resume without losing their
 *     prior name / status)
 */
export default async function OnboardingPage() {
  const user = await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, onboarding_topics, relationship_status, onboarding_completed, onboarding_completed_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const isAlreadyDone = Boolean(
    profile?.onboarding_completed_at ?? profile?.onboarding_completed,
  );
  if (isAlreadyDone) {
    redirect("/chat");
  }

  const initialDisplayName = (profile?.display_name as string | null) ?? "";
  const initialTopics =
    ((profile?.onboarding_topics as string[] | null) ?? []).filter(
      (t): t is OnboardingTopic =>
        (ONBOARDING_TOPICS as readonly string[]).includes(t),
    );
  const rawStatus = profile?.relationship_status as string | null;
  const initialRelationshipStatus: OnboardingRelationshipStatus | null =
    rawStatus &&
    (ONBOARDING_RELATIONSHIP_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as OnboardingRelationshipStatus)
      : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-rose-50/40 to-stone-50">
      <OnboardingFlow
        initialDisplayName={initialDisplayName}
        initialTopics={initialTopics}
        initialRelationshipStatus={initialRelationshipStatus}
      />
    </main>
  );
}
