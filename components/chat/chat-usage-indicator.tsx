import type { ChatUsagePolicy } from "@/features/chat/types";

type ChatUsageIndicatorProps = {
  usage: ChatUsagePolicy;
};

export function ChatUsageIndicator({ usage }: ChatUsageIndicatorProps) {
  if (usage.requires_upgrade || usage.remainingTurns === null) {
    return null;
  }

  const turnsLabel = usage.remainingTurns === 1 ? "mensaje" : "mensajes";

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-300">
      <p className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Free usage</p>
      <p className="mt-2 text-sm leading-6 text-stone-200">
        Te quedan <span className="font-medium text-white">{usage.remainingTurns}</span> {turnsLabel} gratis.
      </p>
    </div>
  );
}