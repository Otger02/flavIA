import { createServerSupabaseClient } from "@/lib/supabase/server";

type GetUserFavoritesParams = {
  userId: string;
  itemType?: string;
};

type UserFavorite = {
  itemId: string;
  itemType: string;
  createdAt: string;
};

export async function getUserFavorites({
  userId,
  itemType,
}: GetUserFavoritesParams): Promise<UserFavorite[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("user_favorites")
    .select("item_id, item_type, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (itemType) {
    query = query.eq("item_type", itemType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[favorites] query failed:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    itemId: row.item_id,
    itemType: row.item_type,
    createdAt: row.created_at,
  }));
}
