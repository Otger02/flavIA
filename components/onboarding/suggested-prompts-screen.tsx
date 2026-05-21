"use client";

import { useTranslations } from "next-intl";

import { getSuggestedPrompts } from "@/features/onboarding/server/get-suggested-prompts";
import type { OnboardingTopic } from "@/features/onboarding/constants";

type Props = {
  topics: OnboardingTopic[];
  onPick: (message?: string) => void;
};

/**
 * The third screen. `getSuggestedPrompts` is pure (no DB) so it works
 * fine on the client — it just maps static constants.
 */
export function SuggestedPromptsScreen({ topics, onPick }: Props) {
  const t = useTranslations("onboarding");
  const prompts = getSuggestedPrompts(topics);

  return (
    <section className="space-y-7 text-center">
      <header className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-4xl italic text-stone-900">
          {t("suggested.title")}
        </h1>
        <p className="mx-auto max-w-md text-base leading-7 text-stone-700">
          {t("suggested.body")}
        </p>
      </header>

      <ul className="space-y-3 text-left">
        {prompts.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              onClick={() => onPick(prompt)}
              aria-label={t("suggested.prompt_aria", { message: prompt })}
              className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-rose-200/50 bg-gradient-to-br from-white to-rose-50/60 p-5 text-left shadow-[0_8px_22px_rgba(180,120,100,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(180,120,100,0.16)]"
            >
              <span className="font-[family-name:var(--font-display)] text-base italic leading-snug text-stone-900">
                “{prompt}”
              </span>
              <span
                aria-hidden
                className="shrink-0 text-rose-500 transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onPick(undefined)}
        className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-stone-900"
      >
        {t("suggested.free_chat_cta")}
      </button>
    </section>
  );
}
