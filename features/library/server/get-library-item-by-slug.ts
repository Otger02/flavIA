import "server-only";

import {
  LIBRARY_AUDIENCES,
  LIBRARY_CONTENT_TYPES,
  LIBRARY_SECTIONS,
  type LibraryAudience,
  type LibraryContentType,
  type LibrarySection,
} from "@/features/library/constants";
import { realLibraryContent } from "@/features/library/real-library-content";
import { sanityClient } from "@/lib/sanity/client";
import { urlForImage } from "@/lib/sanity/image";
import { libraryItemBySlugQuery } from "@/lib/sanity/queries";

export type LibraryItemDetail = {
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
  body: unknown[];
  topicTags: string[];
  intentTags: string[];
  audienceTags: LibraryAudience[];
  sectionTag: LibrarySection | null;
  isPremium: boolean;
  publishedAt: string | null;
  youtubeUrl: string | null;
  relatedContent: Array<{
    contentType: LibraryContentType;
    editorialSource: string | null;
    excerpt: string | null;
    id: string;
    isPremium: boolean;
    slug: string;
    title: string;
    type: LibraryContentType;
    youtubeUrl: string | null;
  }>;
  relatedProducts: Array<{ href: string; title: string }>;
};

type SanityLibraryItemDetail = {
  _id: string;
  _type: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  shortAnswer?: string | null;
  coverImage?: unknown;
  body?: unknown[];
  topicTags?: string[] | null;
  intentTags?: string[] | null;
  audienceTags?: string[] | null;
  sectionTag?: string | null;
  contentType?: string | null;
  editorialSource?: string | null;
  isPremium?: boolean | null;
  chatRecommended?: boolean | null;
  publishedAt?: string | null;
  youtubeUrl?: string | null;
  relatedContent?: Array<{
    _id: string;
    _type: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    contentType?: string | null;
    editorialSource?: string | null;
    isPremium?: boolean | null;
    youtubeUrl?: string | null;
  }> | null;
  relatedProducts?: Array<{ href?: string | null; title?: string | null }> | null;
};

function resolveContentType(value: string | null | undefined, type: string): LibraryContentType {
  if (value && (LIBRARY_CONTENT_TYPES as readonly string[]).includes(value)) {
    return value as LibraryContentType;
  }
  if (type === "quicklyItem") return "quickly";
  if ((LIBRARY_CONTENT_TYPES as readonly string[]).includes(type)) {
    return type as LibraryContentType;
  }
  return "article";
}

function mapLibraryItemDetail(item: SanityLibraryItemDetail): LibraryItemDetail {
  const audienceTags = (item.audienceTags ?? []).filter((value): value is LibraryAudience =>
    (LIBRARY_AUDIENCES as readonly string[]).includes(value),
  );
  const contentType = resolveContentType(item.contentType, item._type);
  const sectionTag =
    item.sectionTag && (LIBRARY_SECTIONS as readonly string[]).includes(item.sectionTag)
      ? (item.sectionTag as LibrarySection)
      : null;

  return {
    chatRecommended: item.chatRecommended ?? false,
    contentType,
    editorialSource: item.editorialSource ?? null,
    id: item._id,
    type: contentType,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? item.shortAnswer ?? null,
    shortAnswer: item.shortAnswer ?? null,
    coverImageUrl: urlForImage(item.coverImage)?.width(1600).height(900).fit("crop").url() ?? null,
    body: item.body ?? [],
    topicTags: item.topicTags ?? [],
    intentTags: item.intentTags ?? [],
    audienceTags,
    sectionTag,
    isPremium: item.isPremium ?? false,
    publishedAt: item.publishedAt ?? null,
    youtubeUrl: item.youtubeUrl ?? null,
    relatedContent: (item.relatedContent ?? []).map((entry) => {
      const entryContentType = resolveContentType(entry.contentType, entry._type);
      return {
        contentType: entryContentType,
        editorialSource: entry.editorialSource ?? null,
        excerpt: entry.excerpt ?? null,
        id: entry._id,
        isPremium: entry.isPremium ?? false,
        slug: entry.slug,
        title: entry.title,
        type: entryContentType,
        youtubeUrl: entry.youtubeUrl ?? null,
      };
    }),
    relatedProducts: (item.relatedProducts ?? []).flatMap((product) => {
      if (!product.title || !product.href) {
        return [];
      }

      return [{ href: product.href, title: product.title }];
    }),
  };
}

function getFallbackLibraryItemBySlug(slug: string): LibraryItemDetail | null {
  const item = realLibraryContent.find((entry) => entry.slug === slug);

  if (!item) {
    return null;
  }

  return {
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
    body: item.body.map((paragraph, index) => ({
      _key: `${item.slug}-${index}`,
      _type: "block",
      children: [{ _key: `${item.slug}-${index}-child`, _type: "span", text: paragraph }],
    })),
    topicTags: item.topicTags,
    intentTags: item.intentTags,
    audienceTags: item.audienceTags ?? [],
    sectionTag: item.sectionTag ?? null,
    isPremium: item.isPremium,
    publishedAt: item.publishedAt,
    youtubeUrl: item.youtubeUrl ?? null,
    relatedContent: item.relatedContentSlugs.flatMap((relatedSlug) => {
      const relatedItem = realLibraryContent.find((entry) => entry.slug === relatedSlug);

      if (!relatedItem) {
        return [];
      }

      return [{
        contentType: relatedItem.contentType,
        editorialSource: relatedItem.editorialSource,
        excerpt: relatedItem.excerpt,
        id: relatedItem.id,
        isPremium: relatedItem.isPremium,
        slug: relatedItem.slug,
        title: relatedItem.title,
        type: relatedItem.contentType,
        youtubeUrl: relatedItem.youtubeUrl ?? null,
      }];
    }),
    relatedProducts: item.relatedProducts,
  };
}

export async function getLibraryItemBySlug(slug: string): Promise<LibraryItemDetail | null> {
  if (!sanityClient) {
    return getFallbackLibraryItemBySlug(slug);
  }

  try {
    const item = await sanityClient.fetch<SanityLibraryItemDetail | null>(
      libraryItemBySlugQuery,
      { slug },
      { next: { revalidate: 60 } },
    );

    return item ? mapLibraryItemDetail(item) : getFallbackLibraryItemBySlug(slug);
  } catch {
    return getFallbackLibraryItemBySlug(slug);
  }
}