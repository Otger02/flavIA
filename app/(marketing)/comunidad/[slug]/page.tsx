import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getUser } from "@/features/auth/server/get-user";
import { getThreadBySlug } from "@/features/community/server/get-threads";
import { getComments } from "@/features/community/server/get-comments";
import { isCommunityEnabled } from "@/lib/feature-flags";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import { getTranslations } from "next-intl/server";
import { CommentSection } from "@/components/community/comment-section";
import { InviteFlaviaButton } from "@/components/community/invite-flavia-button";
import { ReportButton } from "@/components/community/report-button";
import { COMMUNITY_TOPIC_COLORS } from "@/features/community/constants";
import type { CommunityTopic } from "@/features/community/constants";
import { formatDate, getLocale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tc = await getTranslations("community");
  const thread = await getThreadBySlug(slug);
  if (!thread) return { title: tc("thread.not_found") };
  return {
    title: `${thread.title} — Comunidad FlavIA`,
    description: thread.body.slice(0, 160),
  };
}

export default async function ThreadDetailPage({ params }: Props) {
  if (!isCommunityEnabled()) notFound();

  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("shared");
  const tc = await getTranslations("community");
  const thread = await getThreadBySlug(slug);
  if (!thread) notFound();

  const user = await getUser();
  const viewer = user ? await getViewerPlan() : null;
  const isPlus = viewer?.plan && viewer.plan.plan !== BILLING_FREE_PLAN && viewer.plan.status !== "canceled";

  const { comments, total: commentCount } = await getComments({
    targetType: "thread",
    targetId: thread.id,
  });

  const hasAiReply = comments.some((c) => c.is_flavia_ai);

  const topicLabel = thread.topic ? t(`topics.${thread.topic}`) : null;
  const topicColor = thread.topic ? COMMUNITY_TOPIC_COLORS[thread.topic as CommunityTopic] : null;

  const authorLabel = thread.is_anonymous
    ? t("global.anonymous")
    : thread.display_name || t("global.user_label");

  const date = formatDate(thread.created_at, locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Back link */}
      <a href="/comunidad" className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors">
        {tc("thread.back_to_community")}
      </a>

      {/* Thread header */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {thread.is_pinned && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700 border border-amber-200">
              {tc("thread.pinned")}
            </span>
          )}
          {topicLabel && topicColor && (
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${topicColor}`}>
              {topicLabel}
            </span>
          )}
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-stone-900">
          {thread.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-xs text-stone-400">
          <span>{authorLabel}</span>
          <span>&middot;</span>
          <span>{date}</span>
          {user && thread.user_id !== user.id && (
            <>
              <span>&middot;</span>
              <ReportButton targetType="thread" targetId={thread.id} />
            </>
          )}
        </div>
      </div>

      {/* Thread body */}
      <div className="rounded-2xl border border-stone-200/50 bg-white/80 p-6 shadow-[0_2px_12px_rgba(180,120,100,0.06)]">
        <p className="whitespace-pre-wrap text-sm leading-7 text-stone-700">
          {thread.body}
        </p>
      </div>

      {/* Invite Flavia (Plus only) */}
      {isPlus && (
        <div className="flex justify-end">
          <InviteFlaviaButton threadId={thread.id} hasAiReply={hasAiReply} />
        </div>
      )}

      {/* Comments */}
      <CommentSection
        targetType="thread"
        targetId={thread.id}
        initialComments={comments}
        initialTotal={commentCount}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
