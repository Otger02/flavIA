import "server-only";

import { createClient } from "next-sanity";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  getProposal,
} from "@/features/public-content/server/processor/extract-proposals";
import { mapProposalRow } from "@/features/public-content/server/map-rows";
import {
  mapAudienceTags,
  mapTopicTags,
} from "@/features/public-content/constants";
import type {
  PublicContentProposal,
} from "@/features/public-content/types";

/**
 * Approve a proposal — promotes it from "pending" into something
 * useful:
 *
 *   - quickly_item / article → creates a Sanity DRAFT document
 *     (drafts.<id>) so Flavia can review the wording in the Sanity
 *     studio before publishing. Never auto-publishes.
 *   - signature_phrase     → inserts into `flavia_phrase_candidates`
 *     for later inclusion in the system prompt.
 *   - community_thread     → not auto-created; admin pastes manually
 *     into a community thread. We mark approved + record the intent.
 *
 * Idempotent at the row level: re-approving sets status=approved
 * again but won't create a second Sanity draft (we check
 * sanity_draft_id first).
 */
export async function approveProposal(params: {
  proposalId: string;
  reviewerId: string;
  reviewerEmail: string;
  reviewNotes?: string | null;
}): Promise<{ proposal: PublicContentProposal; sanityDraftId: string | null }> {
  const supabase = createAdminSupabaseClient();
  const proposal = await getProposal(params.proposalId);
  if (!proposal) {
    throw new Error("proposal_not_found");
  }
  if (proposal.status === "approved" || proposal.status === "published") {
    return { proposal, sanityDraftId: proposal.sanityDraftId };
  }

  let sanityDraftId: string | null = proposal.sanityDraftId;

  if (proposal.proposalType === "quickly_item" || proposal.proposalType === "article") {
    sanityDraftId = await createSanityDraft(proposal);
  } else if (proposal.proposalType === "signature_phrase") {
    await supabase.from("flavia_phrase_candidates").insert({
      phrase: proposal.fullContent.trim(),
      proposal_id: proposal.id,
      source_quote: proposal.sourceQuote,
      context: proposal.rationale,
      status: "pending",
    });
  }
  // community_thread: nothing to do automatically.

  const { data, error } = await supabase
    .from("public_content_proposals")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: params.reviewerId,
      review_notes: params.reviewNotes ?? null,
      sanity_draft_id: sanityDraftId,
    })
    .eq("id", proposal.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`approve_failed:${error?.message ?? "unknown"}`);
  }

  return { proposal: mapProposalRow(data), sanityDraftId };
}

export async function rejectProposal(params: {
  proposalId: string;
  reviewerId: string;
  reviewNotes?: string | null;
}): Promise<PublicContentProposal> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("public_content_proposals")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: params.reviewerId,
      review_notes: params.reviewNotes ?? null,
    })
    .eq("id", params.proposalId)
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`reject_failed:${error?.message ?? "unknown"}`);
  }
  return mapProposalRow(data);
}

// ──────────────────────────────────────────────────────────────────────
// Sanity helpers
// ──────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[¿?¡!,.:;"'()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Convert plain text into Sanity portable-text blocks. Splits on blank
 * lines into paragraphs. Good enough for proposals — the human review
 * step in the Studio handles fine-grained formatting.
 */
function textToPortable(text: string): Array<Record<string, unknown>> {
  return text
    .split(/\n{2,}/g)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para, i) => ({
      _type: "block",
      _key: `block-${i}`,
      style: "normal",
      markDefs: [],
      children: [
        { _type: "span", _key: `span-${i}`, text: para, marks: [] },
      ],
    }));
}

async function createSanityDraft(proposal: PublicContentProposal): Promise<string | null> {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const apiVersion = process.env.SANITY_API_VERSION ?? "2026-04-05";
  const token = process.env.SANITY_WRITE_TOKEN;

  if (!projectId || !dataset || !token) {
    // Sanity not configured (e.g. dev env). Skip silently — admin sees
    // sanity_draft_id=null in the UI and can still mark approved.
    return null;
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  const slug = slugify(proposal.title) || `proposal-${proposal.id.slice(0, 8)}`;
  const draftId = `drafts.${proposal.proposalType === "quickly_item" ? "quickly" : "article"}-from-source-${proposal.id.slice(0, 8)}`;

  // Map raw Haiku tags → canonical Sanity enum values. Unknowns are
  // dropped (Sanity would reject them anyway). If the mapping produces
  // an empty list we leave the field unset so the editor sees an
  // unfilled selector rather than a wrong default.
  const topicTags = mapTopicTags(proposal.suggestedTopics);
  const audienceTags = mapAudienceTags(proposal.suggestedAudience);

  if (proposal.proposalType === "quickly_item") {
    await client.createOrReplace({
      _id: draftId,
      _type: "quicklyItem",
      title: proposal.title,
      slug: { _type: "slug", current: slug },
      shortAnswer: proposal.fullContent,
      sectionTag: "quickly",
      topicTags,
      audienceTags,
      isPremium: false,
      source: "public_content_proposal",
      publishedAt: new Date().toISOString(),
    });
  } else {
    // article — schema requires topicTags.min(1) and intentTags.min(1),
    // so fall back to a generic default if Haiku gave us nothing
    // usable. The editor will fix it in Studio.
    await client.createOrReplace({
      _id: draftId,
      _type: "article",
      title: proposal.title,
      slug: { _type: "slug", current: slug },
      excerpt: proposal.excerpt,
      body: textToPortable(proposal.fullContent),
      contentType: "article",
      topicTags: topicTags.length > 0 ? topicTags : ["education"],
      intentTags: ["understanding"],
      sectionTag: "tips_educacion_sexual",
      audienceTags,
      isPremium: false,
      chatRecommended: false,
      editorialSource: "Basado en la experiencia real de Flavia Dos Santos",
      publishedAt: new Date().toISOString(),
    });
  }

  return draftId;
}
