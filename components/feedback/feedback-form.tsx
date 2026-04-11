"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type FeedbackFormProps = {
  userId: string;
};

const CATEGORY_KEYS = [
  "new_content",
  "chat_topics",
  "products",
  "improvements",
  "other",
] as const;

type CategoryKey = (typeof CATEGORY_KEYS)[number];

type FormState = "idle" | "submitting" | "success" | "error";

export function FeedbackForm({ userId }: FeedbackFormProps) {
  const t = useTranslations("shared");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit =
    selectedCategory !== null && message.trim().length > 0 && formState !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) return;

    setFormState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? t("feedback.error_generic"));
      }

      setFormState("success");
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : t("feedback.error_unknown"),
      );
    }
  }

  function handleReset() {
    setSelectedCategory(null);
    setMessage("");
    setFormState("idle");
    setErrorMessage("");
  }

  if (formState === "success") {
    return (
      <div className="rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-8 text-center shadow-[0_16px_50px_rgba(180,120,100,0.08)] backdrop-blur">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
          <svg
            className="h-6 w-6 text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-stone-900">
          {t("feedback.success_title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">{t("feedback.success_description")}</p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-6 rounded-full border border-stone-200/60 bg-white/80 px-5 py-2.5 text-xs font-medium text-stone-700 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50"
        >
          {t("feedback.success_reset")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.08)] backdrop-blur sm:p-8"
    >
      {/* Category chips */}
      <fieldset>
        <legend className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          {t("feedback.category_label")}
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((key) => {
            const isSelected = selectedCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition duration-200 ${
                  isSelected
                    ? "border-rose-300 bg-rose-50 text-rose-600 shadow-[0_2px_8px_rgba(220,100,100,0.12)]"
                    : "border-stone-200/60 bg-white/80 text-stone-600 hover:border-rose-200 hover:bg-rose-50/50"
                }`}
              >
                {t(`feedback.category_${key}`)}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Message textarea */}
      <div className="mt-6">
        <label
          htmlFor="feedback-message"
          className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400"
        >
          {t("feedback.message_label")}
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("feedback.message_placeholder")}
          maxLength={2000}
          rows={5}
          className="mt-2 w-full resize-none rounded-2xl border border-stone-200/60 bg-white/60 px-4 py-3 text-sm leading-6 text-stone-900 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        />
        <p className="mt-1 text-right text-xs text-stone-400">
          {message.length}/2000
        </p>
      </div>

      {/* Error message */}
      {formState === "error" && errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200/60 bg-red-50/60 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {/* Submit button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {formState === "submitting" ? t("feedback.submitting") : t("feedback.submit")}
        </button>
      </div>
    </form>
  );
}
