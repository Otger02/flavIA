import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { createBillingPortalSession } from "@/features/billing/server/create-billing-portal-session";
import { billingPortalSessionInputSchema } from "@/features/billing/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = billingPortalSessionInputSchema.safeParse({ ...json, userId: user.id });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid billing portal payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const session = await createBillingPortalSession(parsed.data);
  return NextResponse.json(session, { status: 200 });
}