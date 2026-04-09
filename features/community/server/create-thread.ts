import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { moderateContent } from "./moderate-content";
import type { CommunityThread } from "@/features/community/types";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

type CreateThreadInput = {
  userId: string;
  title: string;
  body: string;
  topic: string | null;
  isAnonymous: boolean;
};

type CreateThreadResult =
  | { ok: true; thread: CommunityThread }
  | { ok: false; error: string; moderated?: boolean };

export async function createThread(input: CreateThreadInput): Promise<CreateThreadResult> {
  const { userId, title, body, topic, isAnonymous } = input;

  // AI moderation
  const modResult = await moderateContent(`${title}\n\n${body}`);
  const status = modResult.decision === "approved" && modResult.confidence > 0.85
    ? "published" as const
    : "hidden" as const;

  // Log moderation decision
  const supabase = await createServerSupabaseClient();

  const slug = slugify(title);

  const { data: thread, error } = await supabase
    .from("community_threads")
    .insert({
      user_id: userId,
      slug,
      title: title.trim(),
      body: body.trim(),
      topic: topic || null,
      is_anonymous: isAnonymous,
      status,
    })
    .select()
    .single();

  if (error) {
    console.error("[community] create thread failed:", error);
    return { ok: false, error: "No se pudo crear la conversacion." };
  }

  // Log moderation
  await supabase.from("community_moderation_log").insert({
    content_type: "thread" as const,
    content_id: thread.id,
    decision: modResult.decision,
    confidence: modResult.confidence,
    reason: modResult.reason,
    model: "gpt-4.1-mini",
  });

  if (status === "hidden") {
    return {
      ok: true,
      thread: thread as CommunityThread,
    };
  }

  return { ok: true, thread: thread as CommunityThread };
}
