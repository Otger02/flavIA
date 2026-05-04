import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

// Sliding window: max N user messages across all sessions in the last T seconds.
// Uses the existing chat_messages table — no extra infrastructure needed.
//
// These limits are generous for normal human conversation (1 message/min is
// the natural pace) but block rapid automated requests.
const WINDOW_SECONDS = 60;
const MAX_PER_WINDOW = 10;

export type ChatRateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfter: number };

export async function checkChatRateLimit(userId: string): Promise<ChatRateLimitResult> {
  const supabase = await createServerSupabaseClient();
  const windowStart = new Date(Date.now() - WINDOW_SECONDS * 1000).toISOString();

  const { count, error } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", windowStart);

  if (error) {
    // Fail open: if we can't check, let the request through rather than
    // blocking legitimate users due to a DB hiccup.
    console.error("[rate-limit] DB error, failing open:", error.message);
    return { allowed: true, remaining: MAX_PER_WINDOW };
  }

  const used = count ?? 0;
  if (used >= MAX_PER_WINDOW) {
    return { allowed: false, retryAfter: WINDOW_SECONDS };
  }

  return { allowed: true, remaining: MAX_PER_WINDOW - used };
}
