import { NextResponse, type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/features/auth/server/get-user";
import { isCommunityEnabled } from "@/lib/feature-flags";
import { enforceCommunityPolicy } from "@/features/community/server/enforce-community-policy";
import { generateFlaviaReply } from "@/features/community/server/generate-flavia-reply";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check Plus access
  const policy = await enforceCommunityPolicy({ userId: user.id, action: "create_thread" });
  if (!policy.allowed) {
    const tErrors = await getTranslations("errors");
    return NextResponse.json({ error: tErrors("plus_only_feature") }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { threadId } = body as Record<string, unknown>;
  if (typeof threadId !== "string") {
    return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  // Check if Flavia already replied
  const { count: aiReplyCount } = await supabase
    .from("community_comments")
    .select("id", { count: "exact", head: true })
    .eq("target_type", "thread")
    .eq("target_id", threadId)
    .eq("is_flavia_ai", true);

  if ((aiReplyCount ?? 0) > 0) {
    const tErrors = await getTranslations("errors");
    return NextResponse.json({ error: tErrors("flavia_already_replied") }, { status: 409 });
  }

  // Get thread + recent replies
  const { data: thread } = await supabase
    .from("community_threads")
    .select("title, body")
    .eq("id", threadId)
    .single();

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const { data: replies } = await supabase
    .from("community_comments")
    .select("content")
    .eq("target_type", "thread")
    .eq("target_id", threadId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(5);

  const result = await generateFlaviaReply({
    threadId,
    threadTitle: thread.title,
    threadBody: thread.body,
    recentReplies: (replies ?? []).map((r: { content: string }) => r.content),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, commentId: result.commentId });
}
