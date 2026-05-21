import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { getUser } from "@/features/auth/server/get-user";
import { getLatestChatSession } from "@/features/chat/server/get-latest-chat-session";
import { getRecentChatSessions } from "@/features/chat/server/get-recent-chat-sessions";
import { getChatHistory } from "@/features/chat/server/get-chat-history";
import { getViewerPlan } from "@/features/billing/server/get-viewer-plan";
import { getLibraryItems } from "@/features/library";
import { getUserFavorites } from "@/features/favorites/server/get-user-favorites";
import { BILLING_FREE_PLAN } from "@/features/billing/constants";
import { TopicStarterCards } from "@/components/chat/topic-starter-cards";
import { TOPIC_BADGE_COLORS, getTopicTranslationKey } from "@/lib/topic-config";
import { EmotionalProgress } from "@/components/dashboard/emotional-progress";
import { SessionSummaryCard } from "@/components/dashboard/session-summary-card";
import { formatRelativeTime, getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard");

  return {
    title: t("meta.dashboard_title"),
    description: t("meta.dashboard_description"),
  };
}

export const dynamic = "force-dynamic";

function topicColor(topic: string | null): string {
  if (!topic) return "bg-rose-50 text-rose-600";
  return TOPIC_BADGE_COLORS[topic as keyof typeof TOPIC_BADGE_COLORS] ?? "bg-rose-50 text-rose-600";
}

function getGreetingKey(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) return null;
  const locale = await getLocale();
  const [t, tShared, tLibrary] = await Promise.all([
    getTranslations("dashboard"),
    getTranslations("shared"),
    getTranslations("library"),
  ]);

  const topicLabel = (topic: string | null) => {
    if (!topic) {
      return tShared("topics.general");
    }

    const key = getTopicTranslationKey(topic);
    return key ? tShared(key) : topic;
  };

  const formatContentType = (contentType: string) => tLibrary(`listing.format_labels.${contentType}`);

  const [latestSession, recentSessions, viewer, libraryItems, userFavorites] = await Promise.all([
    getLatestChatSession({ userId: user.id }),
    getRecentChatSessions({ userId: user.id, limit: 5 }),
    getViewerPlan(),
    getLibraryItems(),
    getUserFavorites({ userId: user.id, itemType: "content" }),
  ]);

  const lastMessage = latestSession
    ? await getChatHistory({ sessionId: latestSession.id, limit: 1 }).then((msgs) => msgs.at(-1) ?? null)
    : null;

  const activeTopic = latestSession?.activeTopic ?? null;
  const hasSessions = recentSessions.length > 0;
  const isFree = !viewer.plan || viewer.plan.plan === BILLING_FREE_PLAN;
  const greeting = t(`greeting.${getGreetingKey()}`);

  // Cross-reference favorites with library items to get full item data
  const favoriteItemIds = new Set(userFavorites.map((f) => f.itemId));
  const favoriteItems = libraryItems.filter((item) => favoriteItemIds.has(item.id));

  // Filter library by active topic if available, fallback to all — exclude favorites to avoid dupes
  const nonFavoriteItems = libraryItems.filter((item) => !favoriteItemIds.has(item.id));
  const topicItems = activeTopic
    ? nonFavoriteItems.filter((item) => item.topicTags.includes(activeTopic))
    : nonFavoriteItems;

  // Prioritize items from thematically relevant sections
  const sectionPriority: Record<string, string[]> = {
    desire: ["tips_educacion_sexual", "lo_mas_hablado"],
    couple_connection: ["te_ha_pasado", "lo_mas_hablado"],
    communication: ["te_ha_pasado", "emocionalmente"],
    curiosity: ["quickly", "tips_educacion_sexual"],
    self_connection: ["emocionalmente", "tips_educacion_sexual"],
    routine: ["te_ha_pasado", "lo_mas_hablado"],
    jealousy: ["emocionalmente", "te_ha_pasado"],
    boundaries: ["emocionalmente", "tips_educacion_sexual"],
    pleasure: ["tips_educacion_sexual", "lo_mas_hablado"],
    menopause: ["tips_educacion_sexual", "lo_mas_hablado"],
    erectile_dysfunction: ["tips_educacion_sexual", "quickly"],
    education: ["tips_educacion_sexual", "te_recomiendo"],
    body_image: ["emocionalmente", "tips_educacion_sexual"],
  };
  const prioritySections = new Set(activeTopic ? sectionPriority[activeTopic] ?? [] : []);
  const sortedItems = [...(topicItems.length >= 3 ? topicItems : nonFavoriteItems)].sort((a, b) => {
    const aInSection = a.sectionTag && prioritySections.has(a.sectionTag) ? 1 : 0;
    const bInSection = b.sectionTag && prioritySections.has(b.sectionTag) ? 1 : 0;
    return bInSection - aInSection;
  });
  const displayItems = sortedItems.slice(0, 3);

  // Pick a daily Flavia quote based on date
  const rawQuotes = t.raw("quotes.items");
  const flaviaQuotes = Array.isArray(rawQuotes)
    ? rawQuotes.filter((quote): quote is string => typeof quote === "string")
    : [];
  const dayIndex = flaviaQuotes.length > 0 ? Math.floor(Date.now() / 86400000) % flaviaQuotes.length : 0;
  const dailyQuote = flaviaQuotes[dayIndex] ?? "";

  return (
    <div className="space-y-8">
      {/* Greeting + quick chat button */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">
            {greeting}
          </h1>
          <p className="mt-2 text-base leading-7 text-stone-600">
            {hasSessions
              ? t("greeting.returning_subtitle")
              : t("greeting.first_subtitle")}
          </p>
        </div>
        <Link
          href="/chat"
          className="hidden shrink-0 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)] sm:inline-flex"
        >
          {t("greeting.cta")}
        </Link>
      </div>

      {/* Daily Flavia quote */}
      <div className="rounded-[1.5rem] border border-rose-200/30 bg-gradient-to-r from-rose-50/40 via-white/60 to-rose-50/30 px-6 py-4">
        <p className="text-center text-sm italic leading-7 text-stone-600">
          &ldquo;{dailyQuote}&rdquo;
        </p>
        <p className="mt-1 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-rose-300">
          — {t("quotes.attribution")}
        </p>
      </div>

      {hasSessions ? (
        <>
          {/* Emotional progress */}
          <EmotionalProgress recentSessions={recentSessions} topicLabel={topicLabel} />

          {/* Resume + Plan row */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Resume conversation card */}
            <div className="rounded-[1.5rem] border border-rose-200/50 bg-white/80 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.08)] backdrop-blur">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
                {t("sections.resume_conversation")}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${topicColor(activeTopic)}`}>
                  {topicLabel(activeTopic)}
                </span>
                <span className="text-xs text-stone-400">{formatRelativeTime(latestSession!.createdAt, locale)}</span>
              </div>
              {lastMessage ? (
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-stone-600 italic">
                  &ldquo;{lastMessage.content}&rdquo;
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/chat"
                  className="rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
                >
                  {t("sections.continue")}
                </Link>
                <Link
                  href="/chat"
                  className="rounded-full border border-stone-200/60 bg-white/80 px-5 py-2.5 text-xs font-medium text-stone-700 transition duration-200 hover:-translate-y-0.5 hover:bg-stone-50"
                >
                  {t("sections.new_session")}
                </Link>
              </div>
            </div>

            {/* Plan card */}
            <div className={`rounded-[1.5rem] border p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)] backdrop-blur ${isFree ? "border-stone-200/50 bg-white/80" : "border-amber-200/50 bg-gradient-to-br from-amber-50/50 via-white/80 to-rose-50/50"}`}>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">{t("sections.plan")}</p>
                {!isFree && (
                  <span className="rounded-full bg-gradient-to-r from-amber-100 to-rose-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-rose-600">
                    {t("sections.plus")}
                  </span>
                )}
              </div>
              {isFree ? (
                <>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl text-stone-900">{t("sections.free_plan")}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {t("sections.free_plan_description")}
                  </p>
                  <Link
                    href="/plans"
                    className="mt-5 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
                  >
                    {t("sections.upgrade")}
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl text-stone-900">
                    {t("sections.plus")}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
                      {t("sections.active")}
                    </span>
                  </p>
                  <Link
                    href="/account"
                    className="mt-5 inline-flex rounded-full border border-stone-200/60 bg-white/80 px-5 py-2.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    {t("sections.manage")}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Session summary */}
          {latestSession && latestSession.messageCount >= 4 ? (
            <SessionSummaryCard sessionId={latestSession.id} />
          ) : null}

          {/* For you now */}
          <div className="rounded-[1.5rem] bg-gradient-to-br from-rose-50/30 to-transparent p-6 -mx-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("sections.for_you")}</p>
            <p className="mt-2 text-sm text-stone-500">
              {activeTopic
                ? t("sections.for_you_topic", { topic: topicLabel(activeTopic).toLowerCase() })
                : t("sections.for_you_default")}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/library/${item.slug}`}
                  className="group overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(180,120,100,0.12)]"
                >
                  {item.coverImageUrl ? (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        width={400}
                        height={225}
                        sizes="(min-width: 768px) 33vw, 50vw"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-rose-50 to-stone-50">
                      <span className="text-xs uppercase tracking-[0.2em] text-rose-300">
                        {formatContentType(item.contentType)}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                      {formatContentType(item.contentType)}
                    </p>
                    <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-base text-stone-900">
                      {item.title}
                    </h3>
                    {item.isPremium ? (
                      <span className="mt-2 inline-block rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-rose-500">
                        {t("sections.plus")}
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Favorites */}
          {favoriteItems.length > 0 ? (
            <div className="rounded-[1.5rem] bg-gradient-to-br from-amber-50/30 via-transparent to-rose-50/20 p-6 -mx-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
                {t("sections.favorites")}
              </p>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                {favoriteItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/library/${item.slug}`}
                    className="group min-w-[200px] flex-shrink-0 overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(180,120,100,0.12)] sm:min-w-0"
                  >
                    {item.coverImageUrl ? (
                      <div className="aspect-video overflow-hidden bg-stone-100">
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          width={400}
                          height={225}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-rose-50 to-stone-50">
                        <span className="text-xs uppercase tracking-[0.2em] text-rose-300">
                          {formatContentType(item.contentType)}
                        </span>
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                        {formatContentType(item.contentType)}
                      </p>
                      <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-base text-stone-900">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Topic entry points */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("sections.choose_topic")}</p>
            <p className="mt-2 text-sm text-stone-500">
              {t("sections.choose_topic_description")}
            </p>
            <div className="mt-4">
              <TopicStarterCards />
            </div>
          </div>

          {/* Recent sessions */}
          {recentSessions.length > 1 ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-stone-400">
                {t("sections.conversations")}
              </p>
              <div className="mt-3 divide-y divide-stone-200/50 overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.04)]">
                {recentSessions.map((session) => (
                  <Link
                    key={session.id}
                    href="/chat"
                    className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-rose-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${topicColor(session.activeTopic)}`}>
                        {topicLabel(session.activeTopic)}
                      </span>
                      <span className="text-xs text-stone-400">{formatRelativeTime(session.createdAt, locale)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-400">{t("sections.conversation_count", { count: session.messageCount })}</span>
                      <span className="text-xs font-medium text-rose-500">{t("sections.resume_action")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* First-time empty state */}
          <div className="rounded-[2rem] border border-rose-200/40 bg-gradient-to-b from-white/90 to-rose-50/50 p-8 text-center shadow-[0_20px_60px_rgba(180,120,100,0.08)]">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
              {t("sections.first_conversation")}
            </p>
            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-stone-600">
              {t("sections.first_conversation_description")}
            </p>
            <Link
              href="/chat"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-7 py-3 text-sm font-medium text-white shadow-[0_12px_30px_rgba(220,100,100,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(220,100,100,0.30)]"
            >
              {t("greeting.cta")}
            </Link>
          </div>

          {/* Topic entry points */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("sections.choose_topic")}</p>
            <p className="mt-2 text-sm text-stone-500">
              {t("sections.choose_topic_description")}
            </p>
            <div className="mt-4">
              <TopicStarterCards />
            </div>
          </div>

          {/* Library for newcomers */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("sections.for_starters")}</p>
            <p className="mt-2 text-sm text-stone-500">
              {t("sections.for_starters_description")}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/library/${item.slug}`}
                  className="group overflow-hidden rounded-[1.25rem] border border-stone-200/50 bg-white/80 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(180,120,100,0.12)]"
                >
                  {item.coverImageUrl ? (
                    <div className="aspect-video overflow-hidden bg-stone-100">
                      <Image
                        src={item.coverImageUrl}
                        alt={item.title}
                        width={400}
                        height={225}
                        sizes="(min-width: 768px) 33vw, 50vw"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-rose-50 to-stone-50">
                      <span className="text-xs uppercase tracking-[0.2em] text-rose-300">
                        {formatContentType(item.contentType)}
                      </span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-stone-400">
                      {formatContentType(item.contentType)}
                    </p>
                    <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-base text-stone-900">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Upgrade card for free users */}
          {isFree ? (
            <div className="rounded-[1.5rem] border border-rose-200/40 bg-gradient-to-br from-white/90 to-rose-50/50 p-6 shadow-[0_16px_50px_rgba(180,120,100,0.06)]">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">{t("sections.plus")}</p>
              <p className="mt-3 font-[family-name:var(--font-display)] text-lg text-stone-900">
                {t("sections.upgrade_title")}
              </p>
              <p className="mt-2 text-sm leading-6 text-stone-500">
                {t("sections.upgrade_description")}
              </p>
              <Link
                href="/plans"
                className="mt-5 inline-flex rounded-full bg-gradient-to-r from-rose-400 to-rose-500 px-5 py-2.5 text-xs font-medium text-white shadow-[0_8px_20px_rgba(220,100,100,0.20)] transition duration-200 hover:-translate-y-0.5"
              >
                {t("sections.view_plans")}
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
