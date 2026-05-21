"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { PersonalizationScreen } from "@/components/onboarding/personalization-screen";
import { SuggestedPromptsScreen } from "@/components/onboarding/suggested-prompts-screen";
import { saveOnboarding } from "@/features/onboarding/server/save-onboarding";
import {
  ONBOARDING_TOPIC_MAX,
  type OnboardingRelationshipStatus,
  type OnboardingTopic,
} from "@/features/onboarding/constants";

type Step = 1 | 2 | 3;

type Props = {
  initialDisplayName: string;
  initialTopics: OnboardingTopic[];
  initialRelationshipStatus: OnboardingRelationshipStatus | null;
};

/**
 * Client-side controller for the 3-screen flow. Holds form state in
 * one place; each screen renders pure UI + bubbles events up. After
 * screen 2's save call resolves, advances to screen 3 with the
 * just-saved topics in hand so the suggested-prompts screen can show
 * something even before the next page render.
 */
export function OnboardingFlow({
  initialDisplayName,
  initialTopics,
  initialRelationshipStatus,
}: Props) {
  const t = useTranslations("onboarding");
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [topics, setTopics] = useState<OnboardingTopic[]>(initialTopics);
  const [relationshipStatus, setRelationshipStatus] =
    useState<OnboardingRelationshipStatus | null>(initialRelationshipStatus);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleTopic(topic: OnboardingTopic) {
    setTopics((current) => {
      if (current.includes(topic)) {
        return current.filter((t) => t !== topic);
      }
      if (current.length >= ONBOARDING_TOPIC_MAX) {
        return current;
      }
      return [...current, topic];
    });
  }

  function selectRelationship(value: OnboardingRelationshipStatus) {
    setRelationshipStatus((current) => (current === value ? null : value));
  }

  function persist(opts: { skipped: boolean }) {
    setError(null);
    startTransition(async () => {
      const payload = opts.skipped
        ? { skipped: true }
        : {
            displayName: displayName.trim() || null,
            topics,
            relationshipStatus,
            skipped: false,
          };
      const result = await saveOnboarding(payload);
      if (!result.ok) {
        setError(t("common.error"));
        return;
      }
      if (opts.skipped) {
        // Skipped users go straight to a clean chat — no point in
        // suggesting prompts based on empty topics.
        router.push("/chat");
        return;
      }
      setStep(3);
    });
  }

  function goToChat(message?: string) {
    if (message && message.trim().length > 0) {
      router.push(`/chat?opening=${encodeURIComponent(message)}`);
    } else {
      router.push("/chat");
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-2xl flex-col justify-center px-5 py-10">
      {step === 1 ? (
        <WelcomeScreen
          onContinue={() => setStep(2)}
          onSkip={() => persist({ skipped: true })}
          isPending={isPending}
        />
      ) : null}

      {step === 2 ? (
        <PersonalizationScreen
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          topics={topics}
          onToggleTopic={toggleTopic}
          relationshipStatus={relationshipStatus}
          onSelectRelationship={selectRelationship}
          onBack={() => setStep(1)}
          onContinue={() => persist({ skipped: false })}
          onSkip={() => persist({ skipped: true })}
          isPending={isPending}
        />
      ) : null}

      {step === 3 ? (
        <SuggestedPromptsScreen topics={topics} onPick={goToChat} />
      ) : null}

      {error ? (
        <p className="mt-4 text-center text-sm text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
