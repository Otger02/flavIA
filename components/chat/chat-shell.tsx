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
    <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-stone-400">Chat</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-white">
              Conversational workspace
            </h1>
          </div>
          <p className="text-xs text-stone-400">{loading ? "Sending..." : "Ready"}</p>
        </div>

        {usage?.requiresUpgrade ? <PaywallCard message={usage.reason ?? undefined} /> : null}
        <ChatMessageList
          hasPersistedSession={Boolean(sessionId || initialSessionId)}
          loading={loading}
          messages={messages}
        />
        {recommendation ? (
          <RecommendationCard recommendation={recommendation} />
        ) : hasHistory ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-stone-400">
            No hay una recomendación para este turno todavía. Cuando el contexto encaje, aparecerá aquí sin interrumpir la conversación.
          </div>
        ) : null}
        {usage ? <ChatUsageIndicator usage={usage} /> : null}
        <ChatInput disabled={isInputDisabled} loading={loading} onSendMessage={sendMessage} />
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
      </div>

      <aside className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-sm text-stone-300">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-400">Session</p>
        <p className="mt-4 break-all leading-6">{sessionId ?? "A new session will be created on first message."}</p>
        <p className="mt-6 leading-6 text-stone-400">
          Reloading this page restores the latest stored session and its recent persisted history.
        </p>
        {!hasHistory ? (
          <div className="mt-6 rounded-[1rem] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-stone-400">
            No hay historial cargado en esta sesión todavía. El primer mensaje activará el flujo completo y la persistencia.
          </div>
        ) : null}
      </aside>
    </section>
  );
}