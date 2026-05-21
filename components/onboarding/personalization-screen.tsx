"use client";

import { useTranslations } from "next-intl";

import {
  ONBOARDING_RELATIONSHIP_STATUSES,
  ONBOARDING_TOPICS,
  ONBOARDING_TOPIC_MAX,
  type OnboardingRelationshipStatus,
  type OnboardingTopic,
} from "@/features/onboarding/constants";

type Props = {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  topics: OnboardingTopic[];
  onToggleTopic: (topic: OnboardingTopic) => void;
  relationshipStatus: OnboardingRelationshipStatus | null;
  onSelectRelationship: (value: OnboardingRelationshipStatus) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  isPending: boolean;
};

export function PersonalizationScreen(props: Props) {
  const t = useTranslations("onboarding");
  const tTopic = useTranslations("onboarding.personalization.topic");
  const tRel = useTranslations("onboarding.personalization.relationship");
  const maxReached = props.topics.length >= ONBOARDING_TOPIC_MAX;

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {t("personalization.title")}
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          {t("personalization.subtitle")}
        </p>
      </header>

      {/* Field 1: display name */}
      <div>
        <label
          htmlFor="onboarding-name"
          className="block text-sm font-medium text-stone-800"
        >
          {t("personalization.name_label")}
        </label>
        <input
          id="onboarding-name"
          type="text"
          value={props.displayName}
          onChange={(e) => props.onDisplayNameChange(e.target.value)}
          maxLength={80}
          placeholder={t("personalization.name_placeholder")}
          className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-base text-stone-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
        />
      </div>

      {/* Field 2: topics multi-select */}
      <div>
        <label className="block text-sm font-medium text-stone-800">
          {t("personalization.topics_label")}
        </label>
        <p className="mt-1 text-xs text-stone-500">{t("personalization.topics_help")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ONBOARDING_TOPICS.map((topic) => {
            const active = props.topics.includes(topic);
            const disabled = !active && maxReached;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => props.onToggleTopic(topic)}
                disabled={disabled}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${
                  active
                    ? "border-[#b06050] bg-gradient-to-r from-[#c4605a] to-[#b06050] text-white shadow-[0_4px_12px_rgba(176,96,80,0.25)]"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                {tTopic(topic)}
              </button>
            );
          })}
        </div>
        {maxReached ? (
          <p className="mt-2 text-xs italic text-rose-600">
            {t("personalization.topics_max_reached")}
          </p>
        ) : null}
      </div>

      {/* Field 3: relationship single-select */}
      <div>
        <label className="block text-sm font-medium text-stone-800">
          {t("personalization.relationship_label")}
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {ONBOARDING_RELATIONSHIP_STATUSES.map((value) => {
            const active = props.relationshipStatus === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => props.onSelectRelationship(value)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`}
              >
                {tRel(value)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={props.onBack}
          disabled={props.isPending}
          className="text-xs text-stone-500 underline-offset-4 hover:underline disabled:opacity-50"
        >
          {t("common.back")}
        </button>
        <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={props.onSkip}
            disabled={props.isPending}
            className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
          >
            {t("common.skip_short")}
          </button>
          <button
            type="button"
            onClick={props.onContinue}
            disabled={props.isPending}
            className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_10px_24px_rgba(220,100,100,0.25)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {props.isPending ? t("common.saving") : t("common.next")}
          </button>
        </div>
      </div>
    </section>
  );
}
