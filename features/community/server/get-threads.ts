import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CommunityThread } from "@/features/community/types";

type GetThreadsOptions = {
  topic?: string;
  page?: number;
  pageSize?: number;
};

export async function getThreads(options: GetThreadsOptions = {}): Promise<{
  threads: CommunityThread[];
  total: number;
}> {
  const { topic, page = 1, pageSize = 20 } = options;
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("community_threads")
    .select("*, profiles!community_threads_user_id_fkey(display_name)", { count: "exact" })
    .eq("status", "published")
    .order("is_pinned", { ascending: false })
    .order("last_activity_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (topic) {
    query = query.eq("topic", topic);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[community] get threads failed:", error);
    return { threads: [], total: 0 };
  }

  const threads: CommunityThread[] = (data ?? []).map((row: Record<string, unknown>) => {
    const profiles = row.profiles as { display_name: string | null } | null;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      slug: row.slug as string,
      title: row.title as string,
      body: row.body as string,
      topic: row.topic as CommunityThread["topic"],
      is_anonymous: row.is_anonymous as boolean,
      status: row.status as CommunityThread["status"],
      is_pinned: row.is_pinned as boolean,
      reply_count: row.reply_count as number,
      last_activity_at: row.last_activity_at as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      display_name: row.is_anonymous ? null : profiles?.display_name ?? null,
    };
  });

  return { threads, total: count ?? 0 };
}

export async function getThreadBySlug(slug: string): Promise<CommunityThread | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("community_threads")
    .select("*, profiles!community_threads_user_id_fkey(display_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;

  const profiles = (data as Record<string, unknown>).profiles as { display_name: string | null } | null;
  return {
    ...(data as unknown as CommunityThread),
    display_name: data.is_anonymous ? null : profiles?.display_name ?? null,
  };
}
