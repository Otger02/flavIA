"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { resetOnboarding } from "@/features/onboarding/server/save-onboarding";

/**
 * Small link in /account that lets a user re-run the onboarding flow.
 * Clears both columns server-side, then navigates. No confirmation
 * dialog — the worst case is the user lands on /onboarding and bails
 * out via "Saltar" again, which costs nothing.
 */
export function ResetOnboardingLink({ label }: { label: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await resetOnboarding();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/onboarding");
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs text-stone-500 underline underline-offset-4 transition hover:text-stone-800 disabled:opacity-60"
      >
        {isPending ? "…" : label}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
