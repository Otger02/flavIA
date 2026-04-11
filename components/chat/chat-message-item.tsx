"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import type { ChatMessage } from "@/features/chat/types";
import { formatRelativeTime } from "@/lib/locale";

type ChatMessageItemProps = {
  message: ChatMessage;
  streaming?: boolean;
  createdAt?: string;
};

export function ChatMessageItem({ message, streaming, createdAt }: ChatMessageItemProps) {
  const locale = useLocale();
  const t = useTranslations("shared");
  const isUser = message.role === "user";
  const isShort = message.content.length < 40;

  return (
    <article
      className={`flex items-end gap-2 animate-message-in ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* Flavia avatar — assistant only */}
      {!isUser && (
        <div className="mb-5 shrink-0">
          <Image
            src="/flavia-avatar.jpeg"
            alt="Flavia"
            width={32}
            height={32}
            className="rounded-full object-cover ring-2 ring-rose-200/50"
          />
        </div>
      )}

      <div className={isShort ? "w-fit" : ""}>
        <div
          className={
            isUser
              ? "max-w-xl rounded-2xl rounded-br-md bg-gradient-to-br from-rose-400 to-rose-500 px-4 py-3 text-sm text-white shadow-[0_8px_20px_rgba(220,100,100,0.15)]"
              : "max-w-xl rounded-2xl rounded-bl-md bg-gradient-to-b from-white to-rose-50/80 border border-rose-200/50 px-4 py-3 text-sm text-stone-800 shadow-[0_6px_16px_rgba(180,120,100,0.08)]"
          }
        >
          <p className={`mb-1.5 text-[10px] uppercase tracking-[0.2em] ${isUser ? "text-rose-200/70" : "text-rose-400/70"}`}>
            {isUser ? t("chat.user_label") : "Flavia"}
          </p>
          <p className="whitespace-pre-wrap leading-relaxed">
            {message.content}
            {streaming ? (
              <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-rose-400/70" />
            ) : null}
          </p>
        </div>

        {/* Timestamp */}
        {createdAt && (
          <p className={`mt-1 text-[10px] text-stone-400 ${isUser ? "text-right pr-1" : "pl-1"}`}>
            {formatRelativeTime(createdAt, locale)}
          </p>
        )}
      </div>

      {/* User indicator — user only */}
      {isUser && (
        <div className="mb-5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-sm">
            <span className="text-[11px] font-semibold text-white">{t("chat.user_label")}</span>
          </div>
        </div>
      )}
    </article>
  );
}
