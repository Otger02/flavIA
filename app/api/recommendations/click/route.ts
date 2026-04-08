import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import {
  markRecommendationClick,
} from "@/features/recommendations/server/log-recommendation";
import { recommendationClickInputSchema } from "@/features/recommendations/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = recommendationClickInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid recommendation click payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await markRecommendationClick(parsed.data);

  return NextResponse.json(result, { status: 200 });
}