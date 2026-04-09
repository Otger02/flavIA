import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { createCheckoutSession } from "@/features/billing/server/create-checkout-session";
import { checkoutSessionInputSchema } from "@/features/billing/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = checkoutSessionInputSchema.safeParse({ ...json, userId: user.id });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid checkout payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const session = await createCheckoutSession(parsed.data);
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("[checkout] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}