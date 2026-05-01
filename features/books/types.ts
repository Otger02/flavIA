import { z } from "zod";

export const externalBookLinkSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
});

export const bookListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  subtitle: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  priceCop: z.number().int().nonnegative(),
  pages: z.number().int().nonnegative().nullable(),
  publishedAt: z.string().nullable(),
});

export const bookDetailSchema = bookListItemSchema.extend({
  description: z.array(z.unknown()),
  teaserExcerpt: z.array(z.unknown()),
  externalLinks: z.array(externalBookLinkSchema),
  hasPdf: z.boolean(),
});

export const bookCheckoutInputSchema = z.object({
  slug: z.string().min(1).max(96),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type ExternalBookLink = z.infer<typeof externalBookLinkSchema>;
export type BookListItem = z.infer<typeof bookListItemSchema>;
export type BookDetail = z.infer<typeof bookDetailSchema>;
export type BookCheckoutInput = z.infer<typeof bookCheckoutInputSchema>;

export type BookPurchase = {
  id: string;
  userId: string;
  bookSlug: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amountCop: number;
  purchasedAt: string;
  refundedAt: string | null;
};
