"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { PaywallCard } from "@/components/chat/paywall-card";
import { ChatUsageIndicator } from "@/components/chat/chat-usage-indicator";
import { RecommendationCard } from "@/components/chat/recommendation-card";
import { useChat } from "@/features/chat/client/use-chat";
import type { ChatMessage, ChatUsagePolicy } from "@/features/chat/types";

const TOPIC_OPENERS: Record<string, string> = {
  desire: "Quiero hablar sobre el deseo. Últimamente siento que algo ha cambiado.",
  communication: "Necesito ayuda para comunicar algo que me cuesta decir.",
  couple_connection: "Siento que mi pareja y yo nos estamos desconectando.",
  pleasure: "Quiero explorar el placer sin vergüenza.",
  boundaries: "Me cuesta poner límites en mis relaciones.",
  routine: "Siento que hemos caído en una rutina y no sé cómo salir.",
};

type ChatShellProps = {
  initialMessages: ChatMessage[];
  initialSessionId: string | null;
  initialUsage: ChatUsagePolicy | null;
  initialTopic?: string | null;
};

export function ChatShell({ initialMessages, initialSessionId, initialUsage, initialTopic }: ChatShellProps) {
  const { error, hasHistory, loading, messages, recommendation, sendMessage, sessionId, usage } = useChat({
    initialMessages,
    initialSessionId: initialSessionId ?? undefined,
    initialUsage,
  });

  const topicSentRef = useRef(false);

  // Auto-send topic opener if navigated with ?topic=
  useEffect(() => {
    if (
      initialTopic &&
      TOPIC_OPENERS[initialTopic] &&
      !topicSentRef.current &&
      !hasHistory &&
      !loading
    ) {
      topicSentRef.current = true;
      void sendMessage(TOPIC_OPENERS[initialTopic]);
    }
  }, [initialTopic, hasHistory, loading, sendMessage]);

  const isInputDisabled = loading || usage?.requiresUpgrade;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-rose-50/50 to-white/50 p-4 border-b border-rose-200/30">
        <div className="flex items-center gap-3">
          <Image
            src="/flavia-avatar.jpeg"
            alt="Flavia"
            width={48}
            height={48}
            className="rounded-full object-cover ring-2 ring-rose-200/40 shadow-sm"
          />
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">Flavia</h1>
            <p className="mt-0.5 text-sm text-stone-500">Tu espacio de conversación íntima</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${loading ? "animate-pulse bg-rose-400" : "bg-emerald-400/80"}`} />
          <p className="text-xs text-stone-500">{loading ? "Escribiendo..." : "Disponible"}</p>
        </div>
      </div>

      {usage?.requiresUpgrade ? <PaywallCard message={usage.reason ?? undefined} /> : null}

      {/* Scrollable messages area */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-[1.5rem] border border-stone-200/60 bg-white/60 shadow-[0_20px_60px_rgba(180,120,100,0.08)] backdrop-blur">
        <ChatMessageList
          hasPersistedSession={Boolean(sessionId || initialSessionId)}
          loading={loading}
          messages={messages}
        />

        {recommendation ? (
          <div className="px-4 pb-4">
            <RecommendationCard recommendation={recommendation} />
          </div>
        ) : null}
      </div>

      {usage ? <ChatUsageIndicator usage={usage} /> : null}

      {/* Fixed input at bottom */}
      <ChatInput disabled={isInputDisabled} loading={loading} onSendMessage={sendMessage} />

      {error ? <p className="mt-2 text-sm text-rose-500">{error}</p> : null}
    </div>
  );
}
