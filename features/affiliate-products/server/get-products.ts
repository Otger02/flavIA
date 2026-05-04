import "server-only";

import { groq } from "next-sanity";

import { sanityClient } from "@/lib/sanity/client";
import { urlForImage } from "@/lib/sanity/image";
import {
  affiliateProductSchema,
  type AffiliateProduct,
} from "@/features/affiliate-products/types";

const productProjection = `{
  _id,
  "slug": slug.current,
  title,
  brand,
  brandDisplayName,
  shortDescription,
  longDescription,
  productImage,
  affiliateUrl,
  priceRange,
  contexts,
  keywords,
  audienceTags,
  priority,
  isActive,
  commissionRate,
  "lastUpdated": coalesce(lastUpdated, _updatedAt)
}`;

const allActiveQuery = groq`
  *[_type == "affiliateProduct" && isActive == true && defined(affiliateUrl) && defined(slug.current)]
  | order(priority desc, _updatedAt desc) ${productProjection}
`;

const bySlugQuery = groq`
  *[_type == "affiliateProduct" && slug.current == $slug][0] ${productProjection}
`;

type SanityRow = {
  _id: string;
  slug: string;
  title: string;
  brand: string;
  brandDisplayName: string;
  shortDescription: string;
  longDescription?: unknown[] | null;
  productImage?: unknown;
  affiliateUrl?: string | null;
  priceRange?: string | null;
  contexts?: string[] | null;
  keywords?: string[] | null;
  audienceTags?: string[] | null;
  priority?: number | null;
  isActive?: boolean | null;
  commissionRate?: number | null;
  lastUpdated?: string | null;
};

/**
 * Defensive mapper. Drops rows that don't satisfy the runtime contract
 * (no affiliateUrl, missing required strings, etc.) — the recommendation
 * surface should never render a half-formed product.
 */
function mapRow(row: SanityRow): AffiliateProduct | null {
  const candidate = {
    id: row._id,
    slug: row.slug,
    title: row.title,
    brand: row.brand,
    brandDisplayName: row.brandDisplayName,
    shortDescription: row.shortDescription,
    longDescription: row.longDescription ?? [],
    productImageUrl:
      urlForImage(row.productImage)?.width(800).height(800).fit("crop").url() ??
      null,
    affiliateUrl: row.affiliateUrl ?? "",
    priceRange: row.priceRange ?? null,
    contexts: row.contexts ?? [],
    keywords: row.keywords ?? [],
    audienceTags: row.audienceTags ?? [],
    priority: row.priority ?? 5,
    isActive: row.isActive ?? false,
    commissionRate: row.commissionRate ?? null,
    lastUpdated: row.lastUpdated ?? new Date(0).toISOString(),
  };

  const parsed = affiliateProductSchema.safeParse(candidate);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[affiliate-products] dropping product ${row._id} (${row.slug}): ${parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ")}`,
      );
    }
    return null;
  }
  return parsed.data;
}

function compact(rows: SanityRow[]): AffiliateProduct[] {
  return rows.flatMap((row) => {
    const mapped = mapRow(row);
    return mapped ? [mapped] : [];
  });
}

/**
 * Returns every active product with a usable affiliate URL, sorted by
 * priority (then updated date as tiebreak). Inactive products and
 * products without a URL never escape this layer.
 */
export async function listProducts(): Promise<AffiliateProduct[]> {
  if (!sanityClient) return [];
  try {
    const rows = await sanityClient.fetch<SanityRow[]>(
      allActiveQuery,
      {},
      { next: { revalidate: 60 } },
    );
    return compact(rows);
  } catch (error) {
    console.error("[affiliate-products] listProducts failed", error);
    return [];
  }
}

/**
 * Returns a single product by slug regardless of `isActive`. Useful for
 * an admin/preview view or for the chat detection layer to fetch a
 * specific product it has matched. Still requires `affiliateUrl` for
 * the runtime contract.
 */
export async function getProductBySlug(
  slug: string,
): Promise<AffiliateProduct | null> {
  if (!sanityClient) return null;
  try {
    const row = await sanityClient.fetch<SanityRow | null>(
      bySlugQuery,
      { slug },
      { next: { revalidate: 60 } },
    );
    return row ? mapRow(row) : null;
  } catch (error) {
    console.error("[affiliate-products] getProductBySlug failed", error);
    return null;
  }
}

/**
 * Returns products whose `contexts` intersect ANY of the input tags.
 * Sorted by:
 *   1. number of matching contexts (more matches = stronger fit)
 *   2. product `priority` (1–10)
 *
 * Empty `tags` returns an empty list — callers should explicitly call
 * `listProducts()` if they want every active product.
 */
export async function getProductsByContext(
  tags: string[],
): Promise<AffiliateProduct[]> {
  if (tags.length === 0) return [];
  const all = await listProducts();
  const tagSet = new Set(tags);

  return all
    .map((product) => ({
      product,
      matches: product.contexts.filter((tag) => tagSet.has(tag)).length,
    }))
    .filter((entry) => entry.matches > 0)
    .sort((a, b) => {
      if (b.matches !== a.matches) return b.matches - a.matches;
      return b.product.priority - a.product.priority;
    })
    .map((entry) => entry.product);
}

/**
 * Returns products whose `keywords` array contains any of the input
 * keywords (case-insensitive substring match). Same priority sort as
 * `getProductsByContext`. Empty input returns an empty list.
 */
export async function getProductsByKeywords(
  keywords: string[],
): Promise<AffiliateProduct[]> {
  if (keywords.length === 0) return [];
  const needles = keywords
    .map((kw) => kw.trim().toLowerCase())
    .filter((kw) => kw.length > 0);
  if (needles.length === 0) return [];

  const all = await listProducts();

  return all
    .map((product) => {
      const haystack = product.keywords.map((kw) => kw.toLowerCase());
      const matches = needles.filter((needle) =>
        haystack.some((kw) => kw.includes(needle) || needle.includes(kw)),
      ).length;
      return { product, matches };
    })
    .filter((entry) => entry.matches > 0)
    .sort((a, b) => {
      if (b.matches !== a.matches) return b.matches - a.matches;
      return b.product.priority - a.product.priority;
    })
    .map((entry) => entry.product);
}
