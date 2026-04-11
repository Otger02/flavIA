import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/features/auth/server/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isCommunityEnabled } from "@/lib/feature-flags";

const VALID_REASONS = ["spam", "harassment", "misinformation", "off_topic", "inappropriate", "other"] as const;
const VALID_TARGETS = ["thread", "comment", "story"] as const;

export async function POST(request: NextRequest) {
  if (!isCommunityEnabled()) {
    return NextResponse.json({ error: "Feature not available" }, { status: 404 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { targetType, targetId, reason, detail } = body as Record<string, unknown>;

  if (!targetType || !VALID_TARGETS.includes(targetType as (typeof VALID_TARGETS)[number])) {
    return NextResponse.json({ error: "Invalid targetType" }, { status: 400 });
  }

  if (typeof targetId !== "string" || !targetId.trim()) {
    return NextResponse.json({ error: "Missing targetId" }, { status: 400 });
  }

  if (!reason || !VALID_REASONS.includes(reason as (typeof VALID_REASONS)[number])) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("community_reports").insert({
    reporter_id: user.id,
    target_type: targetType as "thread" | "comment" | "story",
    target_id: targetId as string,
    reason: reason as "spam" | "harassment" | "misinformation" | "off_topic" | "inappropriate" | "other",
    detail: typeof detail === "string" ? detail.slice(0, 1000) : null,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "You have already reported this content." }, { status: 409 });
    }
    console.error("[community] report failed:", error);
    return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
