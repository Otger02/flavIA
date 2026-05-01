import "server-only";

import { groq } from "next-sanity";

import { sanityClient } from "@/lib/sanity/client";
import { urlForImage } from "@/lib/sanity/image";
import type {
  BookDetail,
  BookListItem,
  ExternalBookLink,
} from "@/features/books/types";

const bookListProjection = `{
  _id,
  title,
  "slug": slug.current,
  subtitle,
  coverImage,
  priceCop,
  pages,
  publishedAt,
  isAvailable
}`;

const bookDetailProjection = `{
  _id,
  title,
  "slug": slug.current,
  subtitle,
  description,
  coverImage,
  priceCop,
  pages,
  publishedAt,
  teaserExcerpt,
  externalLinks,
  isAvailable,
  "hasPdf": defined(pdfFile.asset)
}`;

const booksListQuery = groq`
  *[_type == "book" && isAvailable == true && defined(slug.current)]
  | order(coalesce(publishedAt, _updatedAt) desc) ${bookListProjection}
`;

const bookBySlugQuery = groq`
  *[_type == "book" && slug.current == $slug][0] ${bookDetailProjection}
`;

type SanityBookListRow = {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string | null;
  coverImage?: unknown;
  priceCop?: number | null;
  pages?: number | null;
  publishedAt?: string | null;
  isAvailable?: boolean | null;
};

type SanityBookDetailRow = SanityBookListRow & {
  description?: unknown[] | null;
  teaserExcerpt?: unknown[] | null;
  externalLinks?: Array<{ name?: string | null; url?: string | null }> | null;
  hasPdf?: boolean | null;
};

function mapListItem(row: SanityBookListRow): BookListItem {
  return {
    id: row._id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle ?? null,
    coverImageUrl:
      urlForImage(row.coverImage)?.width(800).height(1200).fit("crop").url() ??
      null,
    priceCop: row.priceCop ?? 30000,
    pages: row.pages ?? null,
    publishedAt: row.publishedAt ?? null,
  };
}

function mapDetail(row: SanityBookDetailRow): BookDetail {
  const externalLinks: ExternalBookLink[] = (row.externalLinks ?? []).flatMap(
    (entry) => {
      if (!entry?.name || !entry?.url) return [];
      return [{ name: entry.name, url: entry.url }];
    },
  );

  return {
    ...mapListItem(row),
    description: (row.description ?? []) as unknown[],
    teaserExcerpt: (row.teaserExcerpt ?? []) as unknown[],
    externalLinks,
    hasPdf: row.hasPdf ?? false,
  };
}

export async function listBooks(): Promise<BookListItem[]> {
  if (!sanityClient) return [];

  try {
    const rows = await sanityClient.fetch<SanityBookListRow[]>(
      booksListQuery,
      {},
      { next: { revalidate: 60 } },
    );
    return rows.map(mapListItem);
  } catch (error) {
    console.error("[books] listBooks failed", error);
    return [];
  }
}

export async function getBookBySlug(slug: string): Promise<BookDetail | null> {
  if (!sanityClient) return null;

  try {
    const row = await sanityClient.fetch<SanityBookDetailRow | null>(
      bookBySlugQuery,
      { slug },
      { next: { revalidate: 60 } },
    );
    return row && row.isAvailable !== false ? mapDetail(row) : null;
  } catch (error) {
    console.error("[books] getBookBySlug failed", error);
    return null;
  }
}
