import { z } from "zod";

export const SOURCE_TYPES = [
  "youtube",
  "media_article",
  "podcast_transcript",
  "manual_text",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const PROPOSAL_TYPES = [
  "quickly_item",
  "article",
  "community_thread",
  "signature_phrase",
] as const;
export type ProposalType = (typeof PROPOSAL_TYPES)[number];

export const SOURCE_STATUSES = ["pending", "processed", "failed"] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export const PROPOSAL_STATUSES = ["pending", "approved", "rejected", "published"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const addSourceInputSchema = z
  .object({
    sourceType: z.enum(SOURCE_TYPES),
    sourceUrl: z.string().min(1).max(2000).optional(),
    rawText: z.string().max(200_000).optional(),
    titleOverride: z.string().trim().max(300).optional().nullable(),
    author: z.string().trim().max(200).optional().nullable(),
    publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  })
  .refine((value) => value.sourceType === "manual_text" || Boolean(value.sourceUrl), {
    message: "sourceUrl is required unless sourceType is manual_text",
    path: ["sourceUrl"],
  })
  .refine((value) => value.sourceType !== "manual_text" || Boolean(value.rawText), {
    message: "rawText is required when sourceType is manual_text",
    path: ["rawText"],
  });

export type AddSourceInput = z.infer<typeof addSourceInputSchema>;

export type ScrapedPublicSource = {
  id: string;
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  author: string | null;
  publishedAt: string | null;
  rawText: string;
  language: string;
  durationMinutes: number | null;
  scrapedAt: string;
  processedAt: string | null;
  status: SourceStatus;
  errorDetails: Record<string, unknown> | null;
  createdAt: string;
};

export type PublicContentProposal = {
  id: string;
  sourceId: string;
  proposalType: ProposalType;
  title: string;
  excerpt: string;
  fullContent: string;
  suggestedTopics: string[];
  suggestedAudience: string[];
  rationale: string | null;
  sourceQuote: string;
  status: ProposalStatus;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  sanityDraftId: string | null;
  createdAt: string;
};

/**
 * Shape Haiku is asked to emit. Validated strictly before insert —
 * a proposal without source_quote is rejected because that's the
 * anti-hallucination guard.
 */
export const llmProposalSchema = z.object({
  type: z.enum(PROPOSAL_TYPES),
  title: z.string().min(2).max(300),
  excerpt: z.string().min(2).max(600),
  full_content: z.string().min(2).max(20_000),
  suggested_topics: z.array(z.string()).max(8).default([]),
  suggested_audience: z.array(z.string()).max(6).default([]),
  rationale: z.string().max(800).optional().nullable(),
  source_quote: z.string().min(2).max(2000),
});
export type LlmProposal = z.infer<typeof llmProposalSchema>;
