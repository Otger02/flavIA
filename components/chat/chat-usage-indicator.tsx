"use client";

import { useTranslations } from "next-intl";

import type { ChatUsagePolicy } from "@/features/chat/types";

type ChatUsageIndicatorProps = {
  usage: ChatUsagePolicy;
};

export function ChatUsageIndicator({ usage }: ChatUsageIndicatorProps) {
  const t = useTranslations("shared");

  if (usage.requires_upgrade || usage.remainingTurns === null) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-300">
      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">{t("chat.usage_eyebrow")}</p>
      <p className="mt-2 text-sm leading-6 text-stone-200">
        {t("chat.usage_remaining", { count: usage.remainingTurns })}
      </p>
    </div>
  );
}