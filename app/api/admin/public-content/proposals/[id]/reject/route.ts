import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/features/professional-verification/server/admin-guard";
import { rejectProposal } from "@/features/public-content/server/approval/approve-proposal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rejectSchema = z.object({
  reviewNotes: z.string().trim().max(2000).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await context.params;

  const json = await request.json().catch(() => ({}));
  const parsed = rejectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const proposal = await rejectProposal({
      proposalId: id,
      reviewerId: admin.id,
      reviewNotes: parsed.data.reviewNotes ?? null,
    });
    return NextResponse.json({ ok: true, proposal }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
