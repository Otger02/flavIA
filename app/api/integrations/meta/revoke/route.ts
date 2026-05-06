import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { ADMIN_EMAILS } from "@/lib/constants";
import { getUser } from "@/features/auth/server/get-user";
import { revokeIntegration } from "@/features/integrations/meta/server/revoke-integration";
import { getOwnIntegration } from "@/features/integrations/meta/server/get-active-integration";

export const runtime = "nodejs";

const requestSchema = z.object({
  integrationId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only let an admin revoke an integration that belongs to them.
  const own = await getOwnIntegration(user.id);
  if (!own || own.id !== parsed.data.integrationId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    await revokeIntegration(parsed.data.integrationId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "revoke_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
