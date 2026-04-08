import type { ChatMessage } from "@/features/chat/types";

type ChatMessageItemProps = {
  message: ChatMessage;
};

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUserMessage = message.role === "user";

  return (
    <article className={isUserMessage ? "self-end" : "self-start"}>
      <div
        className={
          isUserMessage
            ? "max-w-xl rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-900"
            : "max-w-xl rounded-2xl bg-white/10 px-4 py-3 text-sm text-stone-100"
        }
      >
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-stone-400">{message.role}</p>
        <p className="whitespace-pre-wrap leading-6">{message.content}</p>
      </div>
    </article>
  );
}