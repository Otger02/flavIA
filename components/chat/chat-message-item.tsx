import type { ChatMessage } from "@/features/chat/types";

type ChatMessageItemProps = {
  message: ChatMessage;
};

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === "user";

  return (
    <article className={isUser ? "self-end" : "self-start"}>
      <div
        className={
          isUser
            ? "max-w-xl rounded-2xl rounded-br-md bg-gradient-to-br from-rose-400/90 to-rose-500/90 px-4 py-3 text-sm text-white shadow-[0_8px_20px_rgba(220,100,100,0.15)]"
            : "max-w-xl rounded-2xl rounded-bl-md border border-white/[0.06] bg-white/[0.05] px-4 py-3 text-sm text-stone-200 shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
        }
      >
        <p className={`mb-1.5 text-[10px] uppercase tracking-[0.2em] ${isUser ? "text-rose-200/70" : "text-stone-500"}`}>
          {isUser ? "Tú" : "Flavia"}
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </article>
  );
}
