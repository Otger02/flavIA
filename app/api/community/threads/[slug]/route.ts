import { NextResponse } from "next/server";
import { getThreadBySlug } from "@/features/community/server/get-threads";
import { getComments } from "@/features/community/server/get-comments";
import { isCommunityEnabled } from "@/lib/feature-flags";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const { slug } = await params;
  const thread = await getThreadBySlug(slug);

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const { comments, total: commentCount } = await getComments({
    targetType: "thread",
    targetId: thread.id,
  });

  return NextResponse.json({ thread, comments, commentCount });
}
