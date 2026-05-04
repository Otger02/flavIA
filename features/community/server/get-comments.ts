import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { moderateContent } from "./moderate-content";
import type { CommunityComment, CommentTargetType } from "@/features/community/types";

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
  isOfficialReply?: boolean;
};

type CreateCommentResult =
  | { ok: true; comment: CommunityComment }
  | { ok: false; error: string };

export async function createComment(input: CreateCommentInput): Promise<CreateCommentResult> {
  const { userId, targetType, targetId, content, isAnonymous, parentCommentId, isOfficialReply = false } = input;

  const modResult = await moderateContent(content);
  const status = modResult.decision === "approved" && modResult.confidence > 0.85
    ? "published" as const
    : "hidden" as const;

  const supabase = await createServerSupabaseClient();

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
    return { ok: false, error: "No se pudo publicar el comentario." };
  }

  // Log moderation
  await supabase.from("community_moderation_log").insert({
    content_type: "comment" as const,
    content_id: comment.id,
    decision: modResult.decision,
    confidence: modResult.confidence,
    reason: modResult.reason,
    model: "gpt-4.1-mini",
  });

  return { ok: true, comment: comment as CommunityComment };
}
