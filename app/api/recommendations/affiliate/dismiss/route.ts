import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getUser } from "@/features/auth/server/get-user";
import { recordRecommendationEvent } from "@/features/affiliate-products/server/track-recommendation-event";

export const runtime = "nodejs";

const requestSchema = z.object({
  product_slug: z.string().min(1).max(96),
  session_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid affiliate dismiss payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await recordRecommendationEvent({
    userId: user.id,
    sessionId: parsed.data.session_id,
    productSlug: parsed.data.product_slug,
    eventType: "dismissed",
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
