import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/features/professional-verification/server/admin-guard";
import { addSource } from "@/features/public-content/server/add-source";
import { addSourceInputSchema } from "@/features/public-content/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  await requireAdmin();

  const json = await request.json().catch(() => null);
  const parsed = addSourceInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const source = await addSource(parsed.data);
    return NextResponse.json({ ok: true, source }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
