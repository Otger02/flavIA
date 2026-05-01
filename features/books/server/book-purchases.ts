import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { BookPurchase } from "@/features/books/types";
import type { Database } from "@/types/db";

type Row = Database["public"]["Tables"]["book_purchases"]["Row"];

function mapRow(row: Row): BookPurchase {
  return {
    id: row.id,
    userId: row.user_id,
    bookSlug: row.book_slug,
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amountCop: row.amount_cop,
    purchasedAt: row.purchased_at,
    refundedAt: row.refunded_at,
  };
}

/**
 * Reads via the user-scoped Supabase client so RLS enforces ownership.
 * Returns null when there's no active (non-refunded) purchase.
 */
export async function getActivePurchaseForUser(params: {
  userId: string;
  bookSlug: string;
}): Promise<BookPurchase | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("book_purchases")
    .select(
      "id, user_id, book_slug, stripe_session_id, stripe_payment_intent_id, amount_cop, purchased_at, refunded_at, created_at",
    )
    .eq("user_id", params.userId)
    .eq("book_slug", params.bookSlug)
    .is("refunded_at", null)
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load book purchase: ${error.message}`);
  }

  return data ? mapRow(data) : null;
}

/**
 * Server-side check used by listing/detail pages to badge "already owned".
 * Returns the slugs the user has actively purchased (non-refunded).
 */
export async function listOwnedBookSlugs(userId: string): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("book_purchases")
    .select("book_slug")
    .eq("user_id", userId)
    .is("refunded_at", null);

  if (error) {
    console.error("[books] listOwnedBookSlugs failed", error);
    return [];
  }

  return Array.from(new Set((data ?? []).map((row) => row.book_slug)));
}

/**
 * Webhook-side insert. Uses the admin client (bypasses RLS) and is
 * idempotent against `stripe_session_id` UNIQUE.
 */
export async function recordBookPurchase(input: {
  userId: string;
  bookSlug: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  amountCop: number;
}): Promise<BookPurchase> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("book_purchases")
    .upsert(
      {
        user_id: input.userId,
        book_slug: input.bookSlug,
        stripe_session_id: input.stripeSessionId,
        stripe_payment_intent_id: input.stripePaymentIntentId,
        amount_cop: input.amountCop,
      },
      { onConflict: "stripe_session_id" },
    )
    .select(
      "id, user_id, book_slug, stripe_session_id, stripe_payment_intent_id, amount_cop, purchased_at, refunded_at, created_at",
    )
    .single();

  if (error || !data) {
    throw new Error(
      `Unable to record book purchase: ${error?.message ?? "no row returned"}`,
    );
  }

  return mapRow(data);
}
