import Link from "next/link";
import type { CommunityThread } from "@/features/community/types";
import {
  COMMUNITY_TOPIC_LABELS,
  COMMUNITY_TOPIC_COLORS,
} from "@/features/community/constants";
import type { CommunityTopic } from "@/features/community/constants";
import { formatDate, formatRelativeTime } from "@/lib/locale";

type ThreadCardProps = {
  locale: string;
  thread: CommunityThread;
};

export function ThreadCard({ locale, thread }: ThreadCardProps) {
  const topicLabel = thread.topic ? COMMUNITY_TOPIC_LABELS[thread.topic as CommunityTopic] : null;
  const topicColor = thread.topic ? COMMUNITY_TOPIC_COLORS[thread.topic as CommunityTopic] : null;

  const lastActivity = new Date(thread.last_activity_at);
  const daysSinceLastActivity = Math.floor((Date.now() - lastActivity.getTime()) / 86400000);
  const timeAgo = daysSinceLastActivity < 7
    ? formatRelativeTime(thread.last_activity_at, locale)
    : formatDate(thread.last_activity_at, locale, { day: "numeric", month: "short" });
  const authorLabel = thread.is_anonymous
    ? "Anonimo"
    : thread.display_name || "Usuaria";

  return (
    <Link
      href={`/comunidad/${thread.slug}`}
      className="group block rounded-2xl border border-stone-200/50 bg-white/80 p-5 shadow-[0_2px_12px_rgba(180,120,100,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(180,120,100,0.10)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {thread.is_pinned && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 border border-amber-200">
                Fijado
              </span>
            )}
            {topicLabel && topicColor && (
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${topicColor}`}>
                {topicLabel}
              </span>
            )}
          </div>
          <h3 className="font-[family-name:var(--font-display)] text-lg text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-2">
            {thread.title}
          </h3>
          <p className="mt-1.5 text-sm text-stone-500 line-clamp-2">
            {thread.body}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-stone-400">
        <span>{authorLabel}</span>
        <span>&middot;</span>
        <span>{thread.reply_count} {thread.reply_count === 1 ? "respuesta" : "respuestas"}</span>
        <span>&middot;</span>
        <span>{timeAgo}</span>
      </div>
    </Link>
  );
}
