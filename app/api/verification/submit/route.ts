import { NextResponse, type NextRequest } from "next/server";

import { getUser } from "@/features/auth/server/get-user";
import { submitVerificationRequest } from "@/features/professional-verification/server/submit-request";
import { submitVerificationInputSchema } from "@/features/professional-verification/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = submitVerificationInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await submitVerificationRequest({
    userId: user.id,
    userEmail: user.email ?? null,
    input: parsed.data,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, verificationId: result.verification.id }, { status: 200 });
}
