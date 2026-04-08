import "server-only";

import type { LibraryContentType } from "@/features/library/constants";
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
  coverImageUrl: string | null;
  body: unknown[];
  topicTags: string[];
  intentTags: string[];
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
  _type: LibraryContentType;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: unknown;
  body?: unknown[];
  topicTags?: string[] | null;
  intentTags?: string[] | null;
  contentType?: LibraryContentType | null;
  editorialSource?: string | null;
  isPremium?: boolean | null;
  chatRecommended?: boolean | null;
  publishedAt?: string | null;
  youtubeUrl?: string | null;
  relatedContent?: Array<{
    _id: string;
    _type: LibraryContentType;
    title: string;
    slug: string;
    excerpt?: string | null;
    contentType?: LibraryContentType | null;
    editorialSource?: string | null;
    isPremium?: boolean | null;
    youtubeUrl?: string | null;
  }> | null;
  relatedProducts?: Array<{ href?: string | null; title?: string | null }> | null;
};

function mapLibraryItemDetail(item: SanityLibraryItemDetail): LibraryItemDetail {
  return {
    chatRecommended: item.chatRecommended ?? false,
    contentType: item.contentType ?? item._type,
    editorialSource: item.editorialSource ?? null,
    id: item._id,
    type: item.contentType ?? item._type,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt ?? null,
    coverImageUrl: urlForImage(item.coverImage)?.width(1600).height(900).fit("crop").url() ?? null,
    body: item.body ?? [],
    topicTags: item.topicTags ?? [],
    intentTags: item.intentTags ?? [],
    isPremium: item.isPremium ?? false,
    publishedAt: item.publishedAt ?? null,
    youtubeUrl: item.youtubeUrl ?? null,
    relatedContent: (item.relatedContent ?? []).map((entry) => ({
      contentType: entry.contentType ?? entry._type,
      editorialSource: entry.editorialSource ?? null,
      excerpt: entry.excerpt ?? null,
      id: entry._id,
      isPremium: entry.isPremium ?? false,
      slug: entry.slug,
      title: entry.title,
      type: entry.contentType ?? entry._type,
      youtubeUrl: entry.youtubeUrl ?? null,
    })),
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
    coverImageUrl: item.coverImageUrl,
    body: item.body.map((paragraph, index) => ({
      _key: `${item.slug}-${index}`,
      _type: "block",
      children: [{ _key: `${item.slug}-${index}-child`, _type: "span", text: paragraph }],
    })),
    topicTags: item.topicTags,
    intentTags: item.intentTags,
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