import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import {
  LIBRARY_CONTENT_TYPES,
  LIBRARY_TOPIC_TAGS,
  getLibraryItems,
} from "@/features/library";
import { getUser } from "@/features/auth/server/get-user";
import { getUserFavorites } from "@/features/favorites/server/get-user-favorites";
import { FavoriteButton } from "@/components/library/favorite-button";
import { TOPIC_FILTER_COLORS, getTopicTranslationKey } from "@/lib/topic-config";
import { LIBRARY_SECTION_CONFIG, getSectionTranslationKey } from "@/features/library/sections";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("library");
  const title = t("meta.title");
  const description = t("meta.description");

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Flavia`,
      description,
      url: "https://flavia.app/library",
    },
  };
}

export const dynamic = "force-dynamic";

type LibraryPageProps = {
  searchParams: Promise<{
    contentType?: string;
    section?: string;
    topic?: string;
  }>;
};

function buildFilterHref(filters: { contentType?: string | null; section?: string | null; topic?: string | null }) {
  const params = new URLSearchParams();

  if (filters.section) {
    params.set("section", filters.section);
  }

  if (filters.topic) {
    params.set("topic", filters.topic);
  }

  if (filters.contentType) {
    params.set("contentType", filters.contentType);
  }

  const queryString = params.toString();
  return queryString ? `/library?${queryString}` : "/library";
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const [t, tShared] = await Promise.all([
    getTranslations("library"),
    getTranslations("shared"),
  ]);
  const params = await searchParams;
  const selectedSection = params.section ?? null;
  const selectedTopic = params.topic ?? null;
  const selectedContentType = params.contentType ?? null;
  const hasFilters = selectedSection || selectedTopic || selectedContentType;

  const resolveTopicLabel = (topic: string) => {
    const key = getTopicTranslationKey(topic);
    return key ? tShared(key) : topic.replaceAll("_", " ");
  };

  const resolveSectionCopy = (sectionKey: string) => {
    const key = getSectionTranslationKey(sectionKey);

    if (!key) {
      return null;
    }

    return {
      title: tShared(`${key}.title`),
      description: tShared(`${key}.description`),
    };
  };

  const formatContentType = (contentType: string) => t(`listing.format_labels.${contentType}`);
  const sections = LIBRARY_SECTION_CONFIG.map((section) => ({
    ...section,
    copy: resolveSectionCopy(section.key),
  }));
  const selectedSectionCopy = selectedSection ? resolveSectionCopy(selectedSection) : null;

  const [items, user] = await Promise.all([
    getLibraryItems({ contentType: selectedContentType, topic: selectedTopic, section: selectedSection }),
    getUser(),
  ]);

  const favorites = user
    ? await getUserFavorites({ userId: user.id, itemType: "content" })
    : [];
  const favoritedIds = new Set(favorites.map((f) => f.itemId));

  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-stone-500">{t("listing.eyebrow")}</p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-stone-900">
          {selectedSection
            ? selectedSectionCopy?.title ?? t("listing.fallback_title")
            : t("listing.title")}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-stone-700">
          {selectedSection
            ? selectedSectionCopy?.description ?? ""
            : t("listing.subtitle")}
        </p>
      </div>

      {/* Section grid — shown when no filters are active */}
      {!hasFilters ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.key}
              href={`/library?section=${section.key}`}
              className={`group rounded-[1.5rem] border bg-gradient-to-br ${section.color} p-6 shadow-[0_8px_24px_rgba(180,120,100,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(180,120,100,0.12)]`}
            >
              <span className="text-2xl">{section.icon}</span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl text-stone-900">
                {section.copy?.title ?? t("listing.fallback_title")}
              </h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {section.copy?.description ?? ""}
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      {/* Section tabs — shown when any filter is active */}
      {hasFilters ? (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/library"
            className="rounded-full border border-stone-200/60 bg-white/80 px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
          >
            {t("listing.filters.back")}
          </Link>
          {sections.map((section) => (
            <Link
              key={section.key}
              href={buildFilterHref({ section: section.key, topic: null, contentType: null })}
              className={`rounded-full px-4 py-2 text-xs transition ${
                selectedSection === section.key
                  ? "bg-stone-900 text-stone-50"
                  : "bg-stone-100 text-stone-700 hover:bg-stone-200"
              }`}
            >
              {section.icon} {section.copy?.title ?? t("listing.fallback_title")}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Filters panel — shown when browsing items */}
      {hasFilters ? (
        <div className="grid gap-6 rounded-[2rem] border border-stone-300/70 bg-white/75 p-6 shadow-[0_18px_50px_rgba(61,42,24,0.08)] lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{t("listing.filters.by_topic")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={buildFilterHref({ contentType: selectedContentType, section: selectedSection, topic: null })}
                className={`rounded-full px-4 py-2 text-xs transition ${
                  !selectedTopic ? "bg-stone-900 text-stone-50" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {t("listing.filters.all_topics")}
              </Link>
              {LIBRARY_TOPIC_TAGS.map((topic) => {
                const colors = TOPIC_FILTER_COLORS[topic as keyof typeof TOPIC_FILTER_COLORS] ?? { active: "bg-stone-900 text-stone-50", inactive: "bg-stone-100 text-stone-700 hover:bg-stone-200" };
                return (
                  <Link
                    key={topic}
                    href={buildFilterHref({ contentType: selectedContentType, section: selectedSection, topic })}
                    className={`rounded-full px-4 py-2 text-xs transition ${
                      selectedTopic === topic ? colors.active : colors.inactive
                    }`}
                  >
                    {resolveTopicLabel(topic)}
                  </Link>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">{t("listing.filters.by_format")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={buildFilterHref({ contentType: null, section: selectedSection, topic: selectedTopic })}
                className={`rounded-full px-4 py-2 text-xs transition ${
                  !selectedContentType ? "bg-stone-900 text-stone-50" : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {t("listing.filters.all_formats")}
              </Link>
              {LIBRARY_CONTENT_TYPES.map((contentType) => (
                <Link
                  key={contentType}
                  href={buildFilterHref({ contentType, section: selectedSection, topic: selectedTopic })}
                  className={`rounded-full px-4 py-2 text-xs transition ${
                    selectedContentType === contentType
                      ? "bg-stone-900 text-stone-50"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {formatContentType(contentType)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-stone-300 bg-white/70 p-8 text-sm leading-6 text-stone-600">
          {t("listing.empty_state")}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-[2rem] border border-stone-300 bg-white shadow-[0_20px_60px_rgba(61,42,24,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_66px_rgba(61,42,24,0.12)]">
              <Link href={`/library/${item.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-200">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-900 backdrop-blur">
                      {formatContentType(item.contentType)}
                    </span>
                    {item.youtubeUrl ? (
                      <span className="rounded-full bg-amber-200/90 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-900 backdrop-blur">
                        {t("listing.video_badge")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">
                      {item.editorialSource ?? t("listing.source_fallback")}
                    </p>
                    <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-stone-900">
                      {item.title}
                    </h2>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.isPremium ? (
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-stone-50">
                        {t("item.premium_badge")}
                      </span>
                    ) : null}
                    {user ? (
                      <FavoriteButton
                        itemId={item.id}
                        itemType="content"
                        initialFavorited={favoritedIds.has(item.id)}
                      />
                    ) : null}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-700">{item.excerpt ?? t("listing.excerpt_fallback")}</p>
                {item.topicTags.length > 0 || item.intentTags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.topicTags.map((tag) => {
                      const colors = TOPIC_FILTER_COLORS[tag as keyof typeof TOPIC_FILTER_COLORS] ?? { inactive: "bg-stone-100 text-stone-600" };
                      return (
                        <span key={tag} className={`rounded-full px-3 py-1 text-xs ${colors.inactive}`}>
                          {resolveTopicLabel(tag)}
                        </span>
                      );
                    })}
                    {item.intentTags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-stone-200 px-3 py-1 text-xs text-stone-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="mt-5">
                  <Link href={`/library/${item.slug}`} className="text-sm font-medium text-stone-900 underline underline-offset-4">
                    {item.youtubeUrl ? t("listing.view_item") : t("listing.read_item")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}