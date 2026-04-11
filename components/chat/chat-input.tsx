"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { CHAT_MAX_INPUT_LENGTH } from "@/features/chat/constants";

type ChatInputProps = {
  disabled?: boolean;
  loading?: boolean;
  onSendMessage: (text: string) => Promise<unknown> | void;
};

export function ChatInput({ disabled = false, loading = false, onSendMessage }: ChatInputProps) {
  const t = useTranslations("shared");
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!disabled && !loading) {
      textareaRef.current?.focus();
    }
  }, [disabled, loading]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();

    if (!message || disabled || loading || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      setDraft("");
      const result = await onSendMessage(message);

      if (!result) {
        setDraft(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isBlocked = disabled || loading || submitting;

  return (
    <form className="mt-3 flex-shrink-0" onSubmit={handleSubmit}>
      <div className="flex items-end gap-2 rounded-2xl border border-stone-200/60 bg-white/80 p-2 shadow-[0_4px_12px_rgba(180,120,100,0.06)] backdrop-blur">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={2}
          placeholder={t("chat.input_placeholder")}
          maxLength={CHAT_MAX_INPUT_LENGTH}
          disabled={isBlocked}
          className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-stone-900 outline-none placeholder:text-stone-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isBlocked || draft.trim().length === 0}
          className="flex-shrink-0 rounded-xl bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-sm font-medium text-white shadow-[0_6px_16px_rgba(220,100,100,0.20)] transition duration-200 ease-out hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {loading || submitting ? "..." : t("chat.send")}
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between px-1">
        <p className="text-[11px] text-stone-400">
          {disabled ? t("chat.paused") : loading || submitting ? t("chat.processing") : ""}
        </p>
        <p className="text-[11px] text-stone-400">{draft.length}/{CHAT_MAX_INPUT_LENGTH}</p>
      </div>
    </form>
  );
}
