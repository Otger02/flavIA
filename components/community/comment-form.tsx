"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { COMMENT_MIN, COMMENT_MAX } from "@/features/community/constants";

type CommentFormProps = {
  targetType: "thread" | "library_item" | "story";
  targetId: string;
  onCommentAdded?: () => void;
};

export function CommentForm({ targetType, targetId, onCommentAdded }: CommentFormProps) {
  const tc = useTranslations("community");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isValid = content.trim().length >= COMMENT_MIN && content.trim().length <= COMMENT_MAX;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || state === "submitting") return;

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, content, isAnonymous }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || tc("comment_form.error_publish"));
      }

      setContent("");
      setState("idle");
      onCommentAdded?.();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : tc("comment_form.error_unknown"));
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={COMMENT_MAX}
        rows={3}
        placeholder={tc("comment_form.placeholder")}
        className="w-full rounded-xl border border-stone-200/60 bg-white/80 px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200/50"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={isAnonymous}
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative h-5 w-9 rounded-full transition-colors ${
              isAnonymous ? "bg-rose-400" : "bg-stone-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                isAnonymous ? "translate-x-4" : ""
              }`}
            />
          </button>
          <span className="text-xs text-stone-500">
            {isAnonymous ? tc("comment_form.anonymous_on") : tc("comment_form.anonymous_off")}
          </span>
        </div>
        <button
          type="submit"
          disabled={!isValid || state === "submitting"}
          className="rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {state === "submitting" ? tc("comment_form.submitting") : tc("comment_form.submit")}
        </button>
      </div>
      {state === "error" && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
    </form>
  );
}
