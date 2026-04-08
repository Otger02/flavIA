"use client";

import { useRouter } from "next/navigation";

const TOPICS = [
  {
    key: "desire",
    emoji: "\uD83D\uDD25",
    label: "Deseo",
    starter: "Siento que he perdido las ganas y no sé por qué",
  },
  {
    key: "communication",
    emoji: "\uD83D\uDCAC",
    label: "Comunicación",
    starter: "No sé cómo decirle lo que necesito",
  },
  {
    key: "couple_connection",
    emoji: "\uD83D\uDC9E",
    label: "Conexión en pareja",
    starter: "Siento que hemos perdido la chispa",
  },
  {
    key: "pleasure",
    emoji: "\u2728",
    label: "Placer",
    starter: "Quiero explorar qué me gusta de verdad",
  },
  {
    key: "boundaries",
    emoji: "\uD83D\uDEE1\uFE0F",
    label: "Límites",
    starter: "Me cuesta decir que no sin sentirme culpable",
  },
  {
    key: "routine",
    emoji: "\uD83D\uDD04",
    label: "Rutina",
    starter: "Todo se siente repetitivo y quiero cambiarlo",
  },
] as const;

export function TopicStarterCards() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TOPICS.map((topic) => (
        <button
          key={topic.key}
          onClick={() => router.push(`/chat?topic=${topic.key}`)}
          className="group rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-4 text-left shadow-[0_8px_24px_rgba(180,120,100,0.06)] backdrop-blur transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(180,120,100,0.14)]"
        >
          <span className="text-xl">{topic.emoji}</span>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
            {topic.label}
          </p>
          <p className="mt-1.5 text-sm leading-snug text-stone-600">
            {topic.starter}
          </p>
        </button>
      ))}
    </div>
  );
}
