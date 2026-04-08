"use client";

import { useEffect, useRef } from "react";

import { ChatMessageItem } from "@/components/chat/chat-message-item";
import type { ChatMessage } from "@/features/chat/types";

type ChatMessageListProps = {
  hasPersistedSession: boolean;
  loading: boolean;
  messages: ChatMessage[];
};

export function ChatMessageList({ hasPersistedSession, loading, messages }: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const previousLengthRef = useRef(messages.length);

  useEffect(() => {
    const nextBehavior = messages.length > previousLengthRef.current ? "smooth" : "auto";
    endRef.current?.scrollIntoView({ behavior: nextBehavior, block: "end" });
    previousLengthRef.current = messages.length;
  }, [messages, loading]);

  return (
    <div className="flex min-h-[24rem] flex-col gap-3 overflow-y-auto rounded-[1.25rem] border border-white/10 bg-stone-950/40 p-4">
      {messages.length === 0 ? (
        <div className="flex min-h-[16rem] flex-col items-start justify-center rounded-[1rem] border border-dashed border-white/10 bg-white/[0.02] px-5 py-6">
          <p className="text-sm font-medium text-white">
            {hasPersistedSession ? "Esta sesión todavía no tiene historial" : "Aún no tienes conversaciones previas"}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-stone-400">
            {hasPersistedSession
              ? "Puedes enviar tu primer mensaje y Flavia guardará esta conversación automáticamente."
              : "Envía tu primer mensaje para crear una sesión persistida y empezar a construir contexto."}
          </p>
        </div>
      ) : (
        messages.map((message) => <ChatMessageItem key={message.id} message={message} />)
      )}
      {loading ? <p className="text-sm text-stone-400">Esperando la respuesta de Flavia...</p> : null}
      <div ref={endRef} />
    </div>
  );
}