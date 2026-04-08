import "server-only";

import {
  LIBRARY_CONTENT_TYPES,
  LIBRARY_INTENT_TAGS,
  LIBRARY_TOPIC_TAGS,
  type LibraryContentType,
  type LibraryIntentTag,
  type LibraryTopicTag,
} from "@/features/library/constants";
import { realLibraryContent } from "@/features/library/real-library-content";
import { sanityClient } from "@/lib/sanity/client";
import { libraryItemsQuery } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";

export type LibraryItem = {
  chatRecommended: boolean;
  contentType: LibraryContentType;
  editorialSource: string | null;
  id: string;
  type: LibraryContentType;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  topicTags: string[];
  intentTags: string[];
  isPremium: boolean;
  publishedAt: string | null;
  youtubeUrl: string | null;
};

export type LibraryFilters = {
  contentType?: string | null;
  intent?: string | null;
  topic?: string | null;
};

type SanityLibraryItem = {
  _id: string;
  _type: LibraryContentType;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: unknown;
  topicTags?: string[] | null;
  intentTags?: string[] | null;
  contentType?: LibraryContentType | null;
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

  return LIBRARY_TOPIC_TAGS.includes(value as LibraryTopicTag) ? (value as LibraryTopicTag) : null;
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

function mapLibraryItem(item: SanityLibraryItem): LibraryItem {
  return {
    chatRecommended: item.chatRecommended ?? false,
    contentType: item.contentType ?? item._type,
    editorialSource: item.editorialSource ?? null,
    id: item._id,
    type: item.contentType ?? item._type,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? null,
    coverImageUrl: urlForImage(item.coverImage)?.width(1200).height(675).fit("crop").url() ?? null,
    topicTags: item.topicTags ?? [],
    intentTags: item.intentTags ?? [],
    isPremium: item.isPremium ?? false,
    publishedAt: item.publishedAt ?? null,
    youtubeUrl: item.youtubeUrl ?? null,
  };
}

function getFallbackLibraryItems(filters: LibraryFilters): LibraryItem[] {
  const topic = normalizeTopic(filters.topic);
  const intent = normalizeIntent(filters.intent);
  const contentType = normalizeContentType(filters.contentType);

  return realLibraryContent
    .filter((item) => (topic ? item.topicTags.includes(topic) : true))
    .filter((item) => (intent ? item.intentTags.includes(intent) : true))
    .filter((item) => (contentType ? item.contentType === contentType : true))
    .map((item) => ({
      chatRecommended: item.chatRecommended,
      contentType: item.contentType,
      editorialSource: item.editorialSource,
      id: item.id,
      type: item.contentType,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      coverImageUrl: item.coverImageUrl,
      topicTags: item.topicTags,
      intentTags: item.intentTags,
      isPremium: item.isPremium,
      publishedAt: item.publishedAt,
      youtubeUrl: item.youtubeUrl ?? null,
    }));
}

export async function getLibraryItems(filters: LibraryFilters = {}): Promise<LibraryItem[]> {
  const params = {
    contentType: normalizeContentType(filters.contentType),
    intent: normalizeIntent(filters.intent),
    topic: normalizeTopic(filters.topic),
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