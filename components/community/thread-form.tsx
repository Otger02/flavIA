"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  COMMUNITY_TOPICS,
  THREAD_TITLE_MIN,
  THREAD_TITLE_MAX,
  THREAD_BODY_MIN,
  THREAD_BODY_MAX,
} from "@/features/community/constants";

type ThreadFormState = "idle" | "submitting" | "success" | "error";

export function ThreadForm() {
  const t = useTranslations("shared");
  const tc = useTranslations("community");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [formState, setFormState] = useState<ThreadFormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [moderated, setModerated] = useState(false);

  const isValid =
    title.trim().length >= THREAD_TITLE_MIN &&
    title.trim().length <= THREAD_TITLE_MAX &&
    body.trim().length >= THREAD_BODY_MIN &&
    body.trim().length <= THREAD_BODY_MAX;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || formState === "submitting") return;

    setFormState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, topic: topic || null, isAnonymous }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || tc("thread_form.error_create"));
      }

      setModerated(data.moderated === true);
      setFormState("success");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : tc("thread_form.error_unknown"));
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50/60 p-8 text-center">
        <h3 className="font-[family-name:var(--font-display)] text-xl text-emerald-800">
          {moderated ? tc("thread_form.success_moderated_title") : tc("thread_form.success_title")}
        </h3>
        <p className="mt-2 text-sm text-emerald-700">
          {moderated
            ? tc("thread_form.success_moderated_description")
            : tc("thread_form.success_description")}
        </p>
        <a
          href="/comunidad"
          className="mt-4 inline-block rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5"
        >
          {tc("thread_form.success_back")}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="thread-title" className="mb-1.5 block text-sm font-medium text-stone-700">
          {tc("thread_form.title_label")}
        </label>
        <input
          id="thread-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={THREAD_TITLE_MAX}
          placeholder={tc("thread_form.title_placeholder")}
          className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        />
        <p className="mt-1 text-xs text-stone-400">
          {title.length}/{THREAD_TITLE_MAX}
        </p>
      </div>

      <div>
        <label htmlFor="thread-topic" className="mb-1.5 block text-sm font-medium text-stone-700">
          {tc("thread_form.topic_label")}
        </label>
        <select
          id="thread-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-3 text-stone-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        >
          <option value="">{tc("thread_form.topic_none")}</option>
          {COMMUNITY_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {t(`topics.${topic}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="thread-body" className="mb-1.5 block text-sm font-medium text-stone-700">
          {tc("thread_form.body_label")}
        </label>
        <textarea
          id="thread-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={THREAD_BODY_MAX}
          rows={8}
          placeholder={tc("thread_form.body_placeholder")}
          className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
        />
        <div className="mt-1 flex justify-between text-xs text-stone-400">
          <span>{tc("thread_form.body_min", { min: THREAD_BODY_MIN })}</span>
          <span>{body.length}/{THREAD_BODY_MAX}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isAnonymous}
          onClick={() => setIsAnonymous(!isAnonymous)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isAnonymous ? "bg-rose-400" : "bg-stone-200"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isAnonymous ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm text-stone-600">
          {isAnonymous ? tc("thread_form.anonymous_on") : tc("thread_form.anonymous_off")}
        </span>
      </div>

      {formState === "error" && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={!isValid || formState === "submitting"}
        className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(220,100,100,0.18)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(220,100,100,0.25)] disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {formState === "submitting" ? tc("thread_form.submitting") : tc("thread_form.submit")}
      </button>
    </form>
  );
}
