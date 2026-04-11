import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { requireUser } from "@/features/auth/server/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/constants";
import { ModerationDashboard } from "@/components/admin/moderation-dashboard";
import type { ModerationItemData } from "@/components/admin/moderation-item";

export async function generateMetadata(): Promise<Metadata> {
  const tAdmin = await getTranslations("admin");
  return {
    title: tAdmin("meta.moderation_title"),
    description: tAdmin("meta.moderation_description"),
  };
}

export default async function ModeracionPage() {
  const user = await requireUser();
  const tAdmin = await getTranslations("admin");

  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }

  const supabase = await createServerSupabaseClient();

  // Fetch all pending/hidden content across all types, plus recent actioned items
  const [
    { data: threads },
    { data: comments },
    { data: stories },
    { data: reports },
  ] = await Promise.all([
    supabase
      .from("community_threads")
      .select("id, user_id, title, body, topic, is_anonymous, status, created_at")
      .in("status", ["hidden", "published", "removed"])
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("community_comments")
      .select("id, user_id, content, is_anonymous, is_flavia_ai, status, target_type, target_id, created_at")
      .in("status", ["hidden", "published", "removed"])
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("user_stories")
      .select("id, user_id, content, is_anonymous, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("community_reports")
      .select("target_type, target_id, status")
      .eq("status", "pending"),
  ]);

  // Count pending reports per target
  const reportCounts = new Map<string, number>();
  for (const report of reports ?? []) {
    const key = `${report.target_type}-${report.target_id}`;
    reportCounts.set(key, (reportCounts.get(key) ?? 0) + 1);
  }

  // Reported target IDs for quick lookup
  const reportedTargets = new Set(
    (reports ?? []).map((r) => `${r.target_type}-${r.target_id}`),
  );

  // Transform threads
  const threadItems: ModerationItemData[] = (threads ?? []).map((t) => ({
    id: t.id,
    contentType: "thread" as const,
    content: t.body,
    title: t.title,
    topic: t.topic,
    isAnonymous: t.is_anonymous,
    status: t.status,
    createdAt: t.created_at,
    userId: t.user_id,
    reportCount: reportCounts.get(`thread-${t.id}`) ?? 0,
  }));

  // Transform comments
  const commentItems: ModerationItemData[] = (comments ?? []).map((c) => ({
    id: c.id,
    contentType: "comment" as const,
    content: c.content,
    isAnonymous: c.is_anonymous,
    isFlaviaAi: c.is_flavia_ai,
    status: c.status,
    createdAt: c.created_at,
    userId: c.user_id,
    reportCount: reportCounts.get(`comment-${c.id}`) ?? 0,
  }));

  // Transform stories
  const storyItems: ModerationItemData[] = (stories ?? []).map((s) => ({
    id: s.id,
    contentType: "story" as const,
    content: s.content,
    isAnonymous: s.is_anonymous,
    status: s.status,
    createdAt: s.created_at,
    userId: s.user_id,
    reportCount: reportCounts.get(`story-${s.id}`) ?? 0,
  }));

  const allItems = [...threadItems, ...commentItems, ...storyItems];

  // Pending: hidden/pending status OR has pending reports
  const pendingItems = allItems.filter(
    (i) => ["hidden", "pending"].includes(i.status) && !reportedTargets.has(`${i.contentType}-${i.id}`),
  );

  // Reported: items with pending reports
  const reportedItems = allItems.filter(
    (i) => reportedTargets.has(`${i.contentType}-${i.id}`),
  );

  // Actioned: published, approved, removed, rejected
  const actionedItems = allItems
    .filter((i) => ["published", "approved", "removed", "rejected"].includes(i.status) && !reportedTargets.has(`${i.contentType}-${i.id}`))
    .slice(0, 50);

  // Sort pending and reported by most recent first
  pendingItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  reportedItems.sort((a, b) => (b.reportCount ?? 0) - (a.reportCount ?? 0));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-rose-400">
          {tAdmin("page.eyebrow")}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-stone-900">
          {tAdmin("moderation.title")}
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          {tAdmin("moderation.pending_count", { count: pendingItems.length })} &middot;{" "}
          {tAdmin("moderation.tab_reported").toLowerCase()} {reportedItems.length} &middot;{" "}
          {tAdmin("moderation.tab_actioned").toLowerCase()} {actionedItems.length}
        </p>
      </div>

      <ModerationDashboard
        pendingItems={pendingItems}
        reportedItems={reportedItems}
        actionedItems={actionedItems}
      />
    </div>
  );
}
