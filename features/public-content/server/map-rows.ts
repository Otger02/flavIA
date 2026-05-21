import "server-only";

import type {
  PublicContentProposal,
  ScrapedPublicSource,
} from "@/features/public-content/types";
import type { Database } from "@/types/db";

type SourceRow = Database["public"]["Tables"]["scraped_public_sources"]["Row"];
type ProposalRow = Database["public"]["Tables"]["public_content_proposals"]["Row"];

export function mapSourceRow(row: SourceRow): ScrapedPublicSource {
  return {
    id: row.id,
    sourceUrl: row.source_url,
    sourceType: row.source_type,
    title: row.title,
    author: row.author,
    publishedAt: row.published_at,
    rawText: row.raw_text,
    language: row.language,
    durationMinutes: row.duration_minutes,
    scrapedAt: row.scraped_at,
    processedAt: row.processed_at,
    status: row.status,
    errorDetails: row.error_details,
    createdAt: row.created_at,
  };
}

export function mapProposalRow(row: ProposalRow): PublicContentProposal {
  return {
    id: row.id,
    sourceId: row.source_id,
    proposalType: row.proposal_type,
    title: row.title,
    excerpt: row.excerpt,
    fullContent: row.full_content,
    suggestedTopics: row.suggested_topics ?? [],
    suggestedAudience: row.suggested_audience ?? [],
    rationale: row.rationale,
    sourceQuote: row.source_quote,
    status: row.status,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewNotes: row.review_notes,
    sanityDraftId: row.sanity_draft_id,
    createdAt: row.created_at,
  };
}
