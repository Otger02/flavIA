import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/features/professional-verification/server/admin-guard";
import { approveProposal } from "@/features/public-content/server/approval/approve-proposal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const approveSchema = z.object({
  reviewNotes: z.string().trim().max(2000).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  const { id } = await context.params;

  const json = await request.json().catch(() => ({}));
  const parsed = approveSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await approveProposal({
      proposalId: id,
      reviewerId: admin.id,
      reviewerEmail: admin.email,
      reviewNotes: parsed.data.reviewNotes ?? null,
    });
    return NextResponse.json(
      { ok: true, proposal: result.proposal, sanityDraftId: result.sanityDraftId },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
