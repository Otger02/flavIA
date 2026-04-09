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

  const { itemId, itemType } = body as Record<string, unknown>;

  if (typeof itemId !== "string" || itemId.trim().length === 0) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  if (typeof itemType !== "string" || itemType.trim().length === 0) {
    return NextResponse.json(
      { error: "itemType is required" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();

  // Check if favorite already exists
  const { data: existing, error: selectError } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("item_type", itemType.trim())
    .eq("item_id", itemId.trim())
    .maybeSingle();

  if (selectError) {
    console.error("[favorites] select failed:", selectError);
    return NextResponse.json(
      { error: "Could not check favorite" },
      { status: 500 },
    );
  }

  if (existing) {
    // Remove favorite
    const { error: deleteError } = await supabase
      .from("user_favorites")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      console.error("[favorites] delete failed:", deleteError);
      return NextResponse.json(
        { error: "Could not remove favorite" },
        { status: 500 },
      );
    }

    return NextResponse.json({ favorited: false });
  }

  // Add favorite
  const { error: insertError } = await supabase.from("user_favorites").insert({
    user_id: user.id,
    item_type: itemType.trim(),
    item_id: itemId.trim(),
  });

  if (insertError) {
    console.error("[favorites] insert failed:", insertError);
    return NextResponse.json(
      { error: "Could not save favorite" },
      { status: 500 },
    );
  }

  return NextResponse.json({ favorited: true });
}
