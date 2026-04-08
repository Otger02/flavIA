"use client";

import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { PaywallCard } from "@/components/chat/paywall-card";
import { ChatUsageIndicator } from "@/components/chat/chat-usage-indicator";
import { RecommendationCard } from "@/components/chat/recommendation-card";
import { useChat } from "@/features/chat/client/use-chat";
import type { ChatMessage, ChatUsagePolicy } from "@/features/chat/types";

type ChatShellProps = {
  initialMessages: ChatMessage[];
  initialSessionId: string | null;
  initialUsage: ChatUsagePolicy | null;
};

export function ChatShell({ initialMessages, initialSessionId, initialUsage }: ChatShellProps) {
  const { error, hasHistory, loading, messages, recommendation, sendMessage, sessionId, usage } = useChat({
    initialMessages,
    initialSessionId: initialSessionId ?? undefined,
    initialUsage,
  });

  const isInputDisabled = loading || usage?.requiresUpgrade;

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-[2rem] border border-rose-900/15 bg-gradient-to-b from-stone-950/80 to-stone-950/95 p-6 shadow-[0_30px_80px_rgba(40,15,15,0.30)] backdrop-blur-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-white">Flavia</h1>
            <p className="mt-1 text-sm text-rose-300/60">Tu espacio de conversación íntima</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${loading ? "animate-pulse bg-rose-400" : "bg-emerald-400/80"}`} />
            <p className="text-xs text-stone-500">{loading ? "Escribiendo..." : "Disponible"}</p>
          </div>
        </div>

        {usage?.requiresUpgrade ? <PaywallCard message={usage.reason ?? undefined} /> : null}

        <ChatMessageList
          hasPersistedSession={Boolean(sessionId || initialSessionId)}
          loading={loading}
          messages={messages}
        />

        {recommendation ? (
          <RecommendationCard recommendation={recommendation} />
        ) : null}

        {usage ? <ChatUsageIndicator usage={usage} /> : null}

        <ChatInput disabled={isInputDisabled} loading={loading} onSendMessage={sendMessage} />

        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </div>
    </section>
  );
}
