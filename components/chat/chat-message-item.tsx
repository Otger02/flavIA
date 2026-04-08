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
            ? "max-w-xl rounded-2xl rounded-br-md bg-gradient-to-br from-rose-400 to-rose-500 px-4 py-3 text-sm text-white shadow-[0_8px_20px_rgba(220,100,100,0.15)]"
            : "max-w-xl rounded-2xl rounded-bl-md border border-rose-200/40 bg-rose-50/50 px-4 py-3 text-sm text-stone-800 shadow-[0_4px_12px_rgba(180,120,100,0.06)]"
        }
      >
        <p className={`mb-1.5 text-[10px] uppercase tracking-[0.2em] ${isUser ? "text-rose-200/70" : "text-rose-400/70"}`}>
          {isUser ? "Tú" : "Flavia"}
        </p>
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </article>
  );
}
