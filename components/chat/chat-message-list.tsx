"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

import { ChatMessageItem } from "@/components/chat/chat-message-item";
import type { ChatMessage } from "@/features/chat/types";

type ClientChatMessage = ChatMessage & { streaming?: boolean };

type ChatMessageListProps = {
  hasPersistedSession: boolean;
  loading: boolean;
  messages: ClientChatMessage[];
  isPlus?: boolean;
};

export function ChatMessageList({ hasPersistedSession, loading, messages, isPlus = false }: ChatMessageListProps) {
  const t = useTranslations("shared");
  const endRef = useRef<HTMLDivElement | null>(null);
  const previousLengthRef = useRef(messages.length);

  // Track last message content for streaming scroll
  const lastMessageContent = messages.at(-1)?.content ?? "";

  useEffect(() => {
    const nextBehavior = messages.length > previousLengthRef.current ? "smooth" : "auto";
    endRef.current?.scrollIntoView({ behavior: nextBehavior, block: "end" });
    previousLengthRef.current = messages.length;
  }, [messages.length, lastMessageContent, loading]);

  return (
    <div className="flex min-h-full flex-col gap-3 p-4">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100/80">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="text-rose-400">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <p className="font-[family-name:var(--font-display)] text-lg text-stone-900">
            {hasPersistedSession
              ? t("chat.empty_persisted_title")
              : t("chat.empty_new_title")}
          </p>
          <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
            {hasPersistedSession
              ? t("chat.empty_persisted_description")
              : t("chat.empty_new_description")}
          </p>
        </div>
      ) : (
        (() => {
          let assistantCount = 0;
          return messages.map((message) => {
            let isAudioMessage = false;
            if (message.role === "assistant") {
              assistantCount += 1;
              isAudioMessage = assistantCount % 3 !== 0;
            }
            return (
              <ChatMessageItem
                key={message.id}
                message={message}
                streaming={message.streaming}
                createdAt={message.createdAt}
                isAudioMessage={isAudioMessage}
                isPlus={isPlus}
              />
            );
          });
        })()
      )}
      {loading && !messages.some((m) => m.streaming) ? (
        <div className="self-start">
          <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-rose-200/40 bg-rose-50/60 px-4 py-3">
            <div className="flex gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400/60" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400/60" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400/60" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-stone-500">{t("chat.typing_indicator")}</span>
          </div>
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}
