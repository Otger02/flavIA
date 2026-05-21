import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/features/professional-verification/server/admin-guard";
import { reprocessSource } from "@/features/public-content/server/processor/extract-proposals";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await context.params;

  if (!id || id.length < 8) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const result = await reprocessSource(id);
  return NextResponse.json(
    {
      ok: result.status === "processed",
      proposalCount: result.proposals.length,
      llmRejected: result.llmRejected,
      reason: result.reason ?? null,
    },
    { status: result.status === "processed" ? 200 : 400 },
  );
}
