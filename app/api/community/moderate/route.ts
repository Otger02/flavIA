import { NextResponse, type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/features/auth/server/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/constants";
import { isCommunityEnabled } from "@/lib/feature-flags";
import { sendModerationNoticeEmail } from "@/lib/email/send-moderation-notice";

export async function PATCH(request: NextRequest) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const user = await getUser();
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contentType, contentId, action } = body as Record<string, unknown>;

  if (!["thread", "comment", "story"].includes(contentType as string)) {
    return NextResponse.json({ error: "Invalid contentType" }, { status: 400 });
  }

  if (typeof contentId !== "string") {
    return NextResponse.json({ error: "Missing contentId" }, { status: 400 });
  }

  if (!["approve", "hide", "remove"].includes(action as string)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  let updateError: { message: string } | null = null;
  let authorUserId: string | null = null;

  if (contentType === "thread") {
    const statusMap = { approve: "published", hide: "hidden", remove: "removed" } as const;
    const newStatus = statusMap[action as keyof typeof statusMap];
    const { data, error } = await supabase
      .from("community_threads")
      .update({ status: newStatus })
      .eq("id", contentId)
      .select("user_id")
      .single();
    updateError = error;
    authorUserId = data?.user_id ?? null;
  } else if (contentType === "comment") {
    const statusMap = { approve: "published", hide: "hidden", remove: "removed" } as const;
    const newStatus = statusMap[action as keyof typeof statusMap];
    const { data, error } = await supabase
      .from("community_comments")
      .update({ status: newStatus })
      .eq("id", contentId)
      .select("user_id")
      .single();
    updateError = error;
    authorUserId = data?.user_id ?? null;
  } else if (contentType === "story") {
    const statusMap = { approve: "approved", hide: "pending", remove: "rejected" } as const;
    const newStatus = statusMap[action as keyof typeof statusMap];
    const { data, error } = await supabase
      .from("user_stories")
      .update({ status: newStatus })
      .eq("id", contentId)
      .select("user_id")
      .single();
    updateError = error;
    authorUserId = data?.user_id ?? null;
  }

  if (updateError) {
    console.error("[community] moderate failed:", updateError);
    const tErrors = await getTranslations("errors");
    return NextResponse.json({ error: tErrors("moderate_failed") }, { status: 500 });
  }

  // Update any pending reports to "actioned"
  const reportTargetType = contentType as "thread" | "comment" | "story";
  await supabase
    .from("community_reports")
    .update({
      status: "actioned" as const,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      action_taken: action as string,
    })
    .eq("target_type", reportTargetType)
    .eq("target_id", contentId)
    .eq("status", "pending");

  // Notify author on hide/remove (fire-and-forget, never blocks response)
  if (authorUserId && (action === "hide" || action === "remove")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", authorUserId)
      .single();

    if (profile?.email) {
      void sendModerationNoticeEmail({
        to: profile.email,
        contentType: contentType as "thread" | "comment" | "story",
        action,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
