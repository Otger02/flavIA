import { NextResponse, type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/features/auth/server/get-user";
import { getComments, createComment } from "@/features/community/server/get-comments";
import { enforceCommunityPolicy } from "@/features/community/server/enforce-community-policy";
import { isCommunityEnabled } from "@/lib/feature-flags";
import { COMMENT_MIN, COMMENT_MAX } from "@/features/community/constants";
import type { CommentTargetType } from "@/features/community/types";

const VALID_TARGET_TYPES: CommentTargetType[] = ["thread", "library_item", "story"];

export async function GET(request: NextRequest) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get("targetType") as CommentTargetType;
  const targetId = searchParams.get("targetId");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  if (!targetType || !VALID_TARGET_TYPES.includes(targetType) || !targetId) {
    return NextResponse.json({ error: "Missing targetType or targetId" }, { status: 400 });
  }

  const result = await getComments({ targetType, targetId, page });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const policy = await enforceCommunityPolicy({ userId: user.id, action: "create_reply" });
  if (!policy.allowed) {
    return NextResponse.json({ error: policy.reason, remainingCount: policy.remainingCount }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // SECURITY: the previous version destructured `isOfficialReply` from
  // the body and forwarded it to createComment. That let any
  // authenticated user mark their own comment as an "official
  // professional reply" (the terracotta ✦ badge) by sending the flag
  // directly via curl, bypassing the UI's client-side gate. Audit
  // finding F0-1.
  //
  // The client may still send `markAsOfficial: true` to express
  // INTENT, but the server only honours it if the user is actually an
  // approved verified professional. The check happens in createComment
  // via the user's `professional_verifications.status = 'approved'`
  // row. Non-professionals always get is_official_reply = false.
  const { targetType, targetId, content, isAnonymous, parentCommentId, markAsOfficial, isOfficialReply } =
    body as Record<string, unknown>;

  // Accept the new field name `markAsOfficial` going forward. We keep
  // `isOfficialReply` as a tolerated alias for the in-flight legacy
  // client so we don't break the existing comment form during the
  // rollout. Either way, the value is treated only as INTENT — the
  // server still verifies professional status before honouring it.
  const officialIntent = markAsOfficial === true || isOfficialReply === true;

  if (!targetType || !VALID_TARGET_TYPES.includes(targetType as CommentTargetType)) {
    return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
  }

  if (typeof targetId !== "string" || !targetId.trim()) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length < COMMENT_MIN || content.trim().length > COMMENT_MAX) {
    const tErrors = await getTranslations("errors");
    return NextResponse.json(
      { error: tErrors("comment_length", { min: COMMENT_MIN, max: COMMENT_MAX }) },
      { status: 400 },
    );
  }

  const result = await createComment({
    userId: user.id,
    targetType: targetType as CommentTargetType,
    targetId: targetId as string,
    content: content.trim(),
    isAnonymous: isAnonymous === true,
    parentCommentId: typeof parentCommentId === "string" ? parentCommentId : null,
    markAsOfficial: officialIntent,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    comment: result.comment,
    moderated: result.comment.status === "hidden",
  });
}
