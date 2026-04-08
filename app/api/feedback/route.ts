import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

  const { category, message } = body as Record<string, unknown>;

  if (typeof category !== "string" || category.trim().length === 0) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 },
    );
  }

  if (message.length > 2000) {
    return NextResponse.json(
      { error: "Message must be 2000 characters or less" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("user_feedback").insert({
    user_id: user.id,
    category: category.trim(),
    message: message.trim(),
  });

  if (error) {
    console.error("[feedback] insert failed:", error);
    return NextResponse.json(
      { error: "Could not save feedback" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
