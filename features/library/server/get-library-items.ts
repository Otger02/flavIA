import "server-only";

import {
  LIBRARY_AUDIENCES,
  LIBRARY_CONTENT_TYPES,
  LIBRARY_INTENT_TAGS,
  LIBRARY_TOPIC_TAGS,
  LIBRARY_SECTIONS,
  type LibraryContentType,
  type LibraryIntentTag,
  type LibraryTopicTag,
  type LibrarySection,
  type LibraryAudience,
} from "@/features/library/constants";
import { realLibraryContent } from "@/features/library/real-library-content";
import { sanityClient } from "@/lib/sanity/client";
import { libraryItemsQuery } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";

export type LibraryItem = {
  audienceTags?: LibraryAudience[];
  chatRecommended: boolean;
  contentType: LibraryContentType;
  editorialSource: string | null;
  id: string;
  type: LibraryContentType;
  title: string;
  slug: string;
  excerpt: string | null;
  shortAnswer: string | null;
  coverImageUrl: string | null;
  topicTags: string[];
  intentTags: string[];
  isPremium: boolean;
  publishedAt: string | null;
  sectionTag?: LibrarySection;
  youtubeUrl: string | null;
};

export type LibraryFilters = {
  audience?: string | null;
  contentType?: string | null;
  intent?: string | null;
  section?: string | null;
  topic?: string | null;
};

type SanityLibraryItem = {
  _id: string;
  _type: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  shortAnswer?: string | null;
  coverImage?: unknown;
  topicTags?: string[] | null;
  intentTags?: string[] | null;
  sectionTag?: string | null;
  audienceTags?: string[] | null;
  contentType?: string | null;
  editorialSource?: string | null;
  isPremium?: boolean | null;
  chatRecommended?: boolean | null;
  publishedAt?: string | null;
  youtubeUrl?: string | null;
};

function normalizeTopic(value: string | null | undefined): LibraryTopicTag | null {
  if (!value) {
    return null;
  }

  return (LIBRARY_TOPIC_TAGS as readonly string[]).includes(value) ? (value as LibraryTopicTag) : null;
}

function normalizeIntent(value: string | null | undefined): LibraryIntentTag | null {
  if (!value) {
    return null;
  }

  return LIBRARY_INTENT_TAGS.includes(value as LibraryIntentTag) ? (value as LibraryIntentTag) : null;
}

function normalizeContentType(value: string | null | undefined): LibraryContentType | null {
  if (!value) {
    return null;
  }

  return LIBRARY_CONTENT_TYPES.includes(value as LibraryContentType) ? (value as LibraryContentType) : null;
}

function normalizeSection(value: string | null | undefined): LibrarySection | null {
  if (!value) {
    return null;
  }

  return LIBRARY_SECTIONS.includes(value as LibrarySection) ? (value as LibrarySection) : null;
}

function normalizeAudience(value: string | null | undefined): LibraryAudience | null {
  if (!value) {
    return null;
  }

  return (LIBRARY_AUDIENCES as readonly string[]).includes(value)
    ? (value as LibraryAudience)
    : null;
}

function mapLibraryItem(item: SanityLibraryItem): LibraryItem {
  const sectionTag = normalizeSection(item.sectionTag) ?? undefined;
  const audienceTags = (item.audienceTags ?? [])
    .map((value) => normalizeAudience(value))
    .filter((value): value is LibraryAudience => value !== null);
  const resolvedContentType =
    normalizeContentType(item.contentType) ??
    (item._type === "quicklyItem" ? "quickly" : normalizeContentType(item._type)) ??
    "article";

  return {
    chatRecommended: item.chatRecommended ?? false,
    contentType: resolvedContentType,
    editorialSource: item.editorialSource ?? null,
    id: item._id,
    type: resolvedContentType,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? item.shortAnswer ?? null,
    shortAnswer: item.shortAnswer ?? null,
    coverImageUrl: urlForImage(item.coverImage)?.width(1200).height(675).fit("crop").url() ?? null,
    topicTags: item.topicTags ?? [],
    intentTags: item.intentTags ?? [],
    sectionTag,
    audienceTags: audienceTags.length > 0 ? audienceTags : undefined,
    isPremium: item.isPremium ?? false,
    publishedAt: item.publishedAt ?? null,
    youtubeUrl: item.youtubeUrl ?? null,
  };
}

function getFallbackLibraryItems(filters: LibraryFilters): LibraryItem[] {
  const topic = normalizeTopic(filters.topic);
  const intent = normalizeIntent(filters.intent);
  const contentType = normalizeContentType(filters.contentType);
  const section = normalizeSection(filters.section);
  const audience = normalizeAudience(filters.audience);
  const excludeTeens = audience !== "adolescentes";

  return realLibraryContent
    .filter((item) => (topic ? item.topicTags.includes(topic) : true))
    .filter((item) => (intent ? item.intentTags.includes(intent) : true))
    .filter((item) => (contentType ? item.contentType === contentType : true))
    .filter((item) => (section ? item.sectionTag === section : true))
    .filter((item) => (audience ? item.audienceTags?.includes(audience) : true))
    .filter((item) =>
      excludeTeens ? !(item.audienceTags ?? []).includes("adolescentes") : true,
    )
    .map((item) => ({
      audienceTags: item.audienceTags,
      chatRecommended: item.chatRecommended,
      contentType: item.contentType,
      editorialSource: item.editorialSource,
      id: item.id,
      type: item.contentType,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      shortAnswer: null,
      coverImageUrl: item.coverImageUrl,
      topicTags: item.topicTags,
      intentTags: item.intentTags,
      isPremium: item.isPremium,
      publishedAt: item.publishedAt,
      sectionTag: item.sectionTag,
      youtubeUrl: item.youtubeUrl ?? null,
    }));
}

export async function getLibraryItems(filters: LibraryFilters = {}): Promise<LibraryItem[]> {
  const audience = normalizeAudience(filters.audience);
  const params = {
    contentType: normalizeContentType(filters.contentType),
    intent: normalizeIntent(filters.intent),
    topic: normalizeTopic(filters.topic),
    section: normalizeSection(filters.section),
    audience,
    excludeTeens: audience !== "adolescentes",
  };

  if (!sanityClient) {
    return getFallbackLibraryItems(filters);
  }

  try {
    const items = await sanityClient.fetch<SanityLibraryItem[]>(libraryItemsQuery, params, { next: { revalidate: 60 } });

    if (items.length === 0) {
      return getFallbackLibraryItems(filters);
    }

    return items.map(mapLibraryItem);
  } catch {
    return getFallbackLibraryItems(filters);
  }
}