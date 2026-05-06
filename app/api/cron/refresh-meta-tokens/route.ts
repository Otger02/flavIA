import { NextResponse, type NextRequest } from "next/server";

import { refreshExpiringTokens } from "@/features/integrations/meta/server/refresh-token";

export const runtime = "nodejs";

/**
 * Vercel Cron — runs daily at 03:00 UTC (see vercel.json).
 *
 * Authentication: Vercel automatically attaches a `Bearer` token to
 * its cron requests using the `CRON_SECRET` env. If you set that env,
 * we verify it. If you don't, the route still runs but logs a warning
 * — don't expose the project publicly without setting CRON_SECRET, or
 * add an `x-internal` header check + IP allowlist.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const expected = `Bearer ${cronSecret}`;
    if (authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    console.warn(
      "[cron] CRON_SECRET is not set; refresh-meta-tokens accepts unauthenticated calls.",
    );
  }

  const startedAt = new Date().toISOString();
  let result;
  try {
    result = await refreshExpiringTokens();
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error(`[cron] refresh-meta-tokens failed: ${message}`);
    return NextResponse.json({ error: message, startedAt }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      ...result,
      // Don't echo per-row outcomes that include raw error messages from
      // Meta — they may carry user identifiers. The DB row holds the detail.
      outcomes: result.outcomes.map((o) =>
        o.ok
          ? { ok: true, integrationId: o.integration.id }
          : { ok: false, integrationId: o.integrationId, reason: o.reason.slice(0, 80) },
      ),
    },
    { status: 200 },
  );
}
