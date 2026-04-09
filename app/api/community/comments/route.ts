import { NextResponse, type NextRequest } from "next/server";
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

  const { targetType, targetId, content, isAnonymous, parentCommentId } = body as Record<string, unknown>;

  if (!targetType || !VALID_TARGET_TYPES.includes(targetType as CommentTargetType)) {
    return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
  }

  if (typeof targetId !== "string" || !targetId.trim()) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length < COMMENT_MIN || content.trim().length > COMMENT_MAX) {
    return NextResponse.json({ error: `El comentario debe tener entre ${COMMENT_MIN} y ${COMMENT_MAX} caracteres.` }, { status: 400 });
  }

  const result = await createComment({
    userId: user.id,
    targetType: targetType as CommentTargetType,
    targetId: targetId as string,
    content: content.trim(),
    isAnonymous: isAnonymous === true,
    parentCommentId: typeof parentCommentId === "string" ? parentCommentId : null,
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
