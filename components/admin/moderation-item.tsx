"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { COMMUNITY_TOPIC_COLORS } from "@/features/community/constants";
import type { CommunityTopic } from "@/features/community/constants";
import { formatDate } from "@/lib/locale";

export type ModerationContentType = "thread" | "comment" | "story";

export type ModerationItemData = {
  id: string;
  contentType: ModerationContentType;
  content: string;
  title?: string;
  topic?: string | null;
  isAnonymous: boolean;
  isFlaviaAi?: boolean;
  status: string;
  createdAt: string;
  userId: string;
  reportCount?: number;
};

type ModerationItemProps = {
  item: ModerationItemData;
  onAction: (id: string, contentType: ModerationContentType, action: "approve" | "hide" | "remove") => Promise<void>;
};

const contentTypeLabels: Record<ModerationContentType, string> = {
  thread: "Conversacion",
  comment: "Comentario",
  story: "Historia",
};

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  hidden: { label: "Oculto", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/60" },
  flagged: { label: "Reportado", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200/60" },
  pending: { label: "Pendiente", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/60" },
  published: { label: "Publicado", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/60" },
  approved: { label: "Aprobada", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/60" },
  removed: { label: "Eliminado", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200/60" },
  rejected: { label: "Rechazada", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200/60" },
};

export function ModerationItem({ item, onAction }: ModerationItemProps) {
  const locale = useLocale();
  const t = useTranslations("shared");
  const [loading, setLoading] = useState<string | null>(null);
  const cfg = statusConfig[item.status] ?? statusConfig.pending;

  const needsAction = ["hidden", "flagged", "pending"].includes(item.status);

  async function handleAction(action: "approve" | "hide" | "remove") {
    setLoading(action);
    try {
      await onAction(item.id, item.contentType, action);
    } finally {
      setLoading(null);
    }
  }

  return (
    <article
      className={`rounded-[1.5rem] border bg-white/80 p-6 shadow-[0_8px_24px_rgba(180,120,100,0.04)] backdrop-blur transition-opacity ${
        loading ? "opacity-60" : ""
      } ${needsAction ? "border-amber-200/50" : "border-stone-200/50"}`}
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-medium text-stone-600">
          {contentTypeLabels[item.contentType]}
        </span>
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.label}
        </span>
        {item.isFlaviaAi && (
          <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-medium text-rose-600">
            IA Flavia
          </span>
        )}
        {item.reportCount && item.reportCount > 0 ? (
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
            {item.reportCount} reporte{item.reportCount !== 1 ? "s" : ""}
          </span>
        ) : null}
        {item.topic && (
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${COMMUNITY_TOPIC_COLORS[item.topic as CommunityTopic] ?? "bg-stone-100 text-stone-600 border-stone-200"}`}>
            {t(`topics.${item.topic}`)}
          </span>
        )}
        <span className="text-xs text-stone-400">
          {item.isAnonymous ? "Anonimo" : "Con nombre"}
        </span>
        <span className="text-xs text-stone-300">&middot;</span>
        <span className="text-xs text-stone-400">
          {formatDate(item.createdAt, locale)}
        </span>
        <span className="font-mono text-[10px] text-stone-300">
          {item.userId.slice(0, 8)}...
        </span>
      </div>

      {/* Title (threads only) */}
      {item.title && (
        <h3 className="mb-2 text-base font-semibold text-stone-900">{item.title}</h3>
      )}

      {/* Content */}
      <p className="text-sm leading-7 text-stone-700 whitespace-pre-wrap line-clamp-6">
        {item.content}
      </p>

      {/* Actions */}
      {needsAction && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => handleAction("approve")}
            className="rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "approve" ? "..." : "Aprobar"}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => handleAction("hide")}
            className="rounded-xl border border-stone-200/60 bg-white px-4 py-2 text-xs font-medium text-stone-600 shadow-sm transition-all hover:border-amber-200 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "hide" ? "..." : "Ocultar"}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => handleAction("remove")}
            className="rounded-xl border border-stone-200/60 bg-white px-4 py-2 text-xs font-medium text-stone-600 shadow-sm transition-all hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading === "remove" ? "..." : "Eliminar"}
          </button>
        </div>
      )}
    </article>
  );
}
