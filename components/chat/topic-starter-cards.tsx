"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { getTopicTranslationKey } from "@/lib/topic-config";

const TOPICS = [
  {
    key: "desire",
    emoji: "\uD83D\uDD25",
  },
  {
    key: "communication",
    emoji: "\uD83D\uDCAC",
  },
  {
    key: "couple_connection",
    emoji: "\uD83D\uDC9E",
  },
  {
    key: "pleasure",
    emoji: "\u2728",
  },
  {
    key: "boundaries",
    emoji: "\uD83D\uDEE1\uFE0F",
  },
  {
    key: "routine",
    emoji: "\uD83D\uDD04",
  },
  {
    key: "menopause",
    emoji: "\uD83C\uDF3A",
  },
  {
    key: "education",
    emoji: "\uD83D\uDCDA",
  },
] as const;

export function TopicStarterCards() {
  const router = useRouter();
  const tDashboard = useTranslations("dashboard");
  const tShared = useTranslations("shared");

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TOPICS.map((topic) => (
        <button
          key={topic.key}
          onClick={() => router.push(`/chat?topic=${topic.key}`)}
          className="group rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-4 text-left shadow-[0_8px_24px_rgba(180,120,100,0.06)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(180,120,100,0.14)]"
        >
          <span className="text-xl">{topic.emoji}</span>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
            {tShared(getTopicTranslationKey(topic.key) ?? "topics.general")}
          </p>
          <p className="mt-1.5 text-sm leading-snug text-stone-600">
            {tDashboard(`starter_cards.${topic.key}`)}
          </p>
        </button>
      ))}
    </div>
  );
}
