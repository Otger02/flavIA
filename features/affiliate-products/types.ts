import { z } from "zod";

import { LIBRARY_AUDIENCES } from "@/features/library/constants";
import {
  AFFILIATE_BRANDS,
  AFFILIATE_CONTEXT_TAGS,
} from "@/features/affiliate-products/constants";

export const affiliateBrandSchema = z.enum(AFFILIATE_BRANDS);
export const affiliateContextTagSchema = z.enum(AFFILIATE_CONTEXT_TAGS);
export const audienceTagSchema = z.enum(LIBRARY_AUDIENCES);

/**
 * Zod runtime shape of an affiliate product as seen by the rest of the
 * app. Diverges from the Sanity schema in two intentional ways:
 *
 *   1. `affiliateUrl` is REQUIRED here (the Sanity field is optional —
 *      Flavia hasn't sent the affiliate links yet, so seeded products
 *      land without one). The list/lookup helpers below filter rows
 *      where `affiliateUrl` is missing, so consumers always get a
 *      usable URL.
 *
 *   2. `lastUpdated` is REQUIRED here (Sanity provides _updatedAt on
 *      every doc, so the mapper falls back to it).
 */
export const affiliateProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  brand: affiliateBrandSchema,
  brandDisplayName: z.string(),
  shortDescription: z.string().max(200),
  longDescription: z.array(z.unknown()),
  productImageUrl: z.string().url().nullable(),
  affiliateUrl: z.string().url(),
  priceRange: z.string().nullable(),
  contexts: z.array(affiliateContextTagSchema),
  keywords: z.array(z.string()),
  audienceTags: z.array(audienceTagSchema),
  priority: z.number().int().min(1).max(10),
  isActive: z.boolean(),
  commissionRate: z.number().min(0).max(1).nullable(),
  lastUpdated: z.string(),
});

export type AffiliateProduct = z.infer<typeof affiliateProductSchema>;
export type AffiliateBrand = z.infer<typeof affiliateBrandSchema>;
export type AffiliateContextTag = z.infer<typeof affiliateContextTagSchema>;

export type AffiliateProductFilters = {
  contexts?: string[];
  keywords?: string[];
  audience?: string | null;
};
