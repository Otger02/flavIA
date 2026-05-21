import "server-only";

import { getTranslations } from "next-intl/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAiModelConfig } from "@/lib/env";
import { moderateContent } from "./moderate-content";
import type { CommunityComment, CommentTargetType } from "@/features/community/types";

// Logged into community_moderation_log.model. Tracks the primary
// moderator model (OpenAI is tried first in moderate-content.ts);
// fallback runs aren't currently differentiated in the log — improving
// that would require moderateContent() returning the model it used.
const { openAiChatModel: MODERATION_LOG_MODEL } = getAiModelConfig();

type GetCommentsOptions = {
  targetType: CommentTargetType;
  targetId: string;
  page?: number;
  pageSize?: number;
  filterProfessionals?: boolean;
};

export async function getComments(options: GetCommentsOptions): Promise<{
  comments: CommunityComment[];
  total: number;
}> {
  const { targetType, targetId, page = 1, pageSize = 50, filterProfessionals = false } = options;
  const supabase = await createServerSupabaseClient();

  const { data, count, error } = await supabase
    .from("community_comments")
    .select("*, profiles!community_comments_user_id_fkey(display_name)", { count: "exact" })
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("status", "published")
    .order("created_at", { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("[community] get comments failed:", error);
    return { comments: [], total: 0 };
  }

  const comments: CommunityComment[] = (data ?? []).map((row: Record<string, unknown>) => {
    const profiles = row.profiles as { display_name: string | null } | null;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      target_type: row.target_type as CommentTargetType,
      target_id: row.target_id as string,
      parent_comment_id: row.parent_comment_id as string | null,
      content: row.content as string,
      is_anonymous: row.is_anonymous as boolean,
      status: row.status as CommunityComment["status"],
      is_flavia_ai: row.is_flavia_ai as boolean,
      is_official_reply: (row.is_official_reply as boolean) ?? false,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      display_name: row.is_anonymous ? null : profiles?.display_name ?? null,
    };
  });

  // Batch-fetch verification status for non-anonymous, non-AI commenters
  const userIdsToCheck = [
    ...new Set(
      comments
        .filter((c) => !c.is_anonymous && !c.is_flavia_ai)
        .map((c) => c.user_id),
    ),
  ];

  if (userIdsToCheck.length > 0) {
    const { data: verified } = await supabase
      .from("professional_verifications")
      .select("user_id, professional_type, specialty, bio")
      .eq("status", "approved")
      .in("user_id", userIdsToCheck);

    if (verified && verified.length > 0) {
      const verifiedMap = new Map(verified.map((v) => [v.user_id, v]));
      for (const comment of comments) {
        const vp = verifiedMap.get(comment.user_id);
        if (vp) {
          comment.is_verified_professional = true;
          comment.verified_professional_type = vp.professional_type;
          comment.verified_professional_specialty = vp.specialty;
          comment.verified_professional_bio = vp.bio;
        }
      }
    }
  }

  const filtered = filterProfessionals
    ? comments.filter((c) => c.is_verified_professional || c.is_official_reply || c.is_flavia_ai)
    : comments;

  return { comments: filtered, total: filterProfessionals ? filtered.length : (count ?? 0) };
}

type CreateCommentInput = {
  userId: string;
  targetType: CommentTargetType;
  targetId: string;
  content: string;
  isAnonymous: boolean;
  parentCommentId?: string | null;
  /**
   * INTENT to mark as an official professional reply. The actual
   * `is_official_reply` value written to the DB is only `true` if
   * BOTH (a) intent is true AND (b) the user has an approved row in
   * `professional_verifications`. Non-professionals always get false.
   *
   * Anonymous comments can never be official — the badge requires a
   * named author for accountability.
   */
  markAsOfficial?: boolean;
};

type CreateCommentResult =
  | { ok: true; comment: CommunityComment }
  | { ok: false; error: string };

export async function createComment(input: CreateCommentInput): Promise<CreateCommentResult> {
  const { userId, targetType, targetId, content, isAnonymous, parentCommentId, markAsOfficial = false } = input;

  const modResult = await moderateContent(content);
  const status = modResult.decision === "approved" && modResult.confidence > 0.85
    ? "published" as const
    : "hidden" as const;

  const supabase = await createServerSupabaseClient();

  // SECURITY: derive `is_official_reply` server-side. Only honour the
  // markAsOfficial intent if the user is an approved verified
  // professional AND the comment is non-anonymous. This is the only
  // path that can ever write `is_official_reply = true` from a user
  // request (admin operations bypass via service role).
  let isOfficialReply = false;
  if (markAsOfficial && !isAnonymous) {
    const { data: verification } = await supabase
      .from("professional_verifications")
      .select("status")
      .eq("user_id", userId)
      .eq("status", "approved")
      .maybeSingle();
    if (verification) {
      isOfficialReply = true;
    }
  }

  const { data: comment, error } = await supabase
    .from("community_comments")
    .insert({
      user_id: userId,
      target_type: targetType,
      target_id: targetId,
      parent_comment_id: parentCommentId || null,
      content: content.trim(),
      is_anonymous: isAnonymous,
      is_official_reply: isOfficialReply,
      status,
    })
    .select()
    .single();

  if (error) {
    console.error("[community] create comment failed:", error);
    const tErrors = await getTranslations("errors");
    return { ok: false, error: tErrors("comment_publish_failed") };
  }

  // Log moderation
  await supabase.from("community_moderation_log").insert({
    content_type: "comment" as const,
    content_id: comment.id,
    decision: modResult.decision,
    confidence: modResult.confidence,
    reason: modResult.reason,
    model: MODERATION_LOG_MODEL,
  });

  return { ok: true, comment: comment as CommunityComment };
}
