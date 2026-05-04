import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/server/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OnboardingFlow } from "./onboarding-flow";

export const metadata = {
  title: "Bienvenida — Flavia",
};

export default async function OnboardingPage() {
  const user = await requireUser();

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
