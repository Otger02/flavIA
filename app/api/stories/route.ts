import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ADMIN_EMAILS } from "@/lib/constants";

export async function PATCH(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { storyId, status } = body as Record<string, unknown>;

  if (typeof storyId !== "string") {
    return NextResponse.json({ error: "Missing storyId" }, { status: 400 });
  }

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "Status must be 'approved' or 'rejected'" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("user_stories")
    .update({ status })
    .eq("id", storyId);

  if (error) {
    console.error("[stories] update failed:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la historia" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

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

  const { content, isAnonymous } = body as Record<string, unknown>;

  if (typeof content !== "string" || content.trim().length < 20) {
    return NextResponse.json(
      { error: "La historia debe tener al menos 20 caracteres" },
      { status: 400 },
    );
  }

  if (content.length > 5000) {
    return NextResponse.json(
      { error: "La historia no puede superar los 5000 caracteres" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("user_stories").insert({
    user_id: user.id,
    content: content.trim(),
    is_anonymous: isAnonymous !== false, // default anonymous
    status: "pending",
  });

  if (error) {
    console.error("[stories] insert failed:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la historia" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
