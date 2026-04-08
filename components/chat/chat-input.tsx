"use client";

import { useEffect, useRef, useState } from "react";

import { CHAT_MAX_INPUT_LENGTH } from "@/features/chat/constants";

type ChatInputProps = {
  disabled?: boolean;
  loading?: boolean;
  onSendMessage: (text: string) => Promise<unknown> | void;
};

export function ChatInput({ disabled = false, loading = false, onSendMessage }: ChatInputProps) {
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
  const helperText = disabled
    ? "El chat está bloqueado para esta cuenta ahora mismo."
    : loading || submitting
      ? "Flavia está procesando tu mensaje."
      : "Los mensajes se guardan automáticamente en Supabase.";

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={4}
        placeholder="Write your next message..."
        maxLength={CHAT_MAX_INPUT_LENGTH}
        disabled={isBlocked}
        className="w-full rounded-2xl border border-white/10 bg-stone-900 px-4 py-3 text-sm text-white outline-none placeholder:text-stone-500 disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-stone-400">{helperText}</p>
          <p className="mt-1 text-[11px] text-stone-500">{draft.length}/{CHAT_MAX_INPUT_LENGTH}</p>
        </div>
        <button
          type="submit"
          disabled={isBlocked || draft.trim().length === 0}
          className="rounded-full bg-stone-100 px-5 py-2 text-sm font-medium text-stone-900 disabled:opacity-60"
        >
          {loading || submitting ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}