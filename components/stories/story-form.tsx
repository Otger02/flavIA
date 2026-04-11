"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type StoryFormProps = {
  userId: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function StoryForm({ userId }: StoryFormProps) {
  const tc = useTranslations("community");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = content.trim().length >= 20 && formState !== "submitting";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) return;

    setFormState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? tc("stories.form_error_generic"));
      }

      setFormState("success");
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : tc("stories.form_error_unknown"),
      );
    }
  }

  function handleReset() {
    setContent("");
    setIsAnonymous(true);
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
          {tc("stories.form_success_title")}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          {tc("stories.form_success_description")}
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-6 rounded-full border border-stone-200/60 bg-white/80 px-5 py-2.5 text-xs font-medium text-stone-700 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50"
        >
          {tc("stories.form_success_reset")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.08)] backdrop-blur sm:p-8"
    >
      {/* Content */}
      <div>
        <label
          htmlFor="story-content"
          className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400"
        >
          {tc("stories.form_label")}
        </label>
        <textarea
          id="story-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={tc("stories.form_placeholder")}
          maxLength={5000}
          rows={8}
          className="mt-2 w-full resize-none rounded-2xl border border-stone-200/60 bg-white/60 px-4 py-3 text-sm leading-6 text-stone-900 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-stone-400">{tc("stories.form_min_chars")}</p>
          <p className="text-xs text-stone-400">{content.length}/5000</p>
        </div>
      </div>

      {/* Anonymous toggle */}
      <div className="mt-6">
        <label className="flex cursor-pointer items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isAnonymous}
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-200/50 ${
              isAnonymous ? "bg-rose-400" : "bg-stone-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                isAnonymous ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm text-stone-700">
            {isAnonymous ? tc("stories.form_anonymous_on") : tc("stories.form_anonymous_off")}
          </span>
        </label>
        <p className="mt-1.5 ml-14 text-xs text-stone-400">
          {isAnonymous
            ? tc("stories.form_anonymous_hint_on")
            : tc("stories.form_anonymous_hint_off")}
        </p>
      </div>

      {/* Error */}
      {formState === "error" && errorMessage ? (
        <div className="mt-4 rounded-xl border border-red-200/60 bg-red-50/60 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {/* Submit */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {formState === "submitting" ? tc("stories.form_submitting") : tc("stories.form_submit")}
        </button>
      </div>
    </form>
  );
}
