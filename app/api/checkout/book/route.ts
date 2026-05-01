import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { createBookCheckoutSession } from "@/features/books/server/create-book-checkout-session";
import { bookCheckoutInputSchema } from "@/features/books/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bookCheckoutInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid book checkout payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const session = await createBookCheckoutSession({
      userId: user.id,
      slug: parsed.data.slug,
      successUrl: parsed.data.successUrl,
      cancelUrl: parsed.data.cancelUrl,
    });

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Book checkout failed";
    console.error("[books][checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
