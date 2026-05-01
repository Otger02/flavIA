import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { getActivePurchaseForUser } from "@/features/books/server/book-purchases";
import { getBookPdfAsset } from "@/features/books/server/get-book-pdf";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

/**
 * Streams (well, redirects to) the PDF for a book the caller has actively
 * purchased. Strict gates, in order:
 *
 *   1. User must be authenticated.
 *   2. There must be a `book_purchases` row for this user + slug with
 *      `refunded_at IS NULL`. Read happens via the user-scoped Supabase
 *      client so RLS enforces ownership at the database boundary too.
 *   3. The book must exist in Sanity AND have a PDF asset attached.
 *
 * Each download attempt is logged (success or denial) for analytics.
 *
 * Currently issues a 302 to the Sanity asset URL. Sanity's asset URLs
 * carry an unguessable asset ID; the URL is never embedded in any
 * server-rendered page or client bundle, so leaking it requires the
 * caller to already have either auth + a purchase row, or direct
 * access to this endpoint's response (which itself requires auth +
 * a purchase row). See features/books/server/get-book-pdf.ts for a note
 * on tightening this with Sanity asset `secret` mode.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;

  const user = await getUser();
  if (!user) {
    console.warn(`[books][download] denied (anonymous) slug=${slug}`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let purchase;
  try {
    purchase = await getActivePurchaseForUser({ userId: user.id, bookSlug: slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "purchase lookup failed";
    console.error(`[books][download] purchase lookup error: ${message}`);
    return NextResponse.json({ error: "purchase_lookup_failed" }, { status: 500 });
  }

  if (!purchase) {
    console.warn(
      `[books][download] denied (no purchase) user=${user.id} slug=${slug}`,
    );
    return NextResponse.json({ error: "purchase_required" }, { status: 403 });
  }

  if (purchase.refundedAt) {
    console.warn(
      `[books][download] denied (refunded) user=${user.id} slug=${slug} refunded_at=${purchase.refundedAt}`,
    );
    return NextResponse.json({ error: "purchase_refunded" }, { status: 403 });
  }

  const asset = await getBookPdfAsset(slug);
  if (!asset) {
    console.error(`[books][download] no PDF asset on book slug=${slug}`);
    return NextResponse.json({ error: "pdf_unavailable" }, { status: 404 });
  }

  console.info(
    `[books][download] granted user=${user.id} slug=${slug} purchase=${purchase.id}`,
  );

  // 302 to the asset URL with a Content-Disposition hint (some browsers
  // honor the redirect target's headers; we add a query string to be
  // explicit about the filename for the user's downloads folder).
  const target = new URL(asset.url);
  target.searchParams.set("dl", asset.filename);

  return NextResponse.redirect(target.toString(), { status: 302 });
}
