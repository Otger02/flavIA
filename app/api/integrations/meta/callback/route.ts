import { NextResponse, type NextRequest } from "next/server";

import { getPublicEnv, getServerEnv } from "@/lib/env";
import { exchangeCodeAndStoreIntegration } from "@/features/integrations/meta/server/exchange-code";
import { verifyOAuthState } from "@/features/integrations/meta/server/sign-state";

export const runtime = "nodejs";

/**
 * OAuth callback. Verifies the signed state, exchanges the code for
 * a long-lived token, fetches connected page + IG account info, and
 * upserts into `meta_integrations`.
 *
 * Always redirects (never returns JSON) so the browser ends up at a
 * sensible page. Error reasons are surfaced via a `?error=<code>`
 * query string — the admin page maps codes to localised copy.
 */
export async function GET(request: NextRequest) {
  const { NEXT_PUBLIC_APP_URL } = getPublicEnv();
  const adminBase = NEXT_PUBLIC_APP_URL.replace(/\/$/, "") + "/admin/integraciones";

  function fail(code: string): NextResponse {
    const url = new URL(adminBase);
    url.searchParams.set("error", code);
    return NextResponse.redirect(url.toString(), { status: 302 });
  }

  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");

  if (error) {
    console.warn(
      `[meta] OAuth callback returned error=${error} reason=${errorReason ?? ""} desc=${errorDescription ?? ""}`,
    );
    // Most common: user_denied
    return fail(error === "access_denied" ? "user_denied" : "meta_returned_error");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return fail("missing_code_or_state");
  }

  let payload;
  try {
    payload = verifyOAuthState(state);
  } catch (err) {
    const message = err instanceof Error ? err.message : "state_invalid";
    console.warn(`[meta] state verification failed: ${message}`);
    return fail("state_invalid");
  }

  const env = getServerEnv();
  if (!env.META_APP_ID || !env.META_APP_SECRET || !env.META_REDIRECT_URI) {
    return fail("not_configured");
  }

  try {
    await exchangeCodeAndStoreIntegration({
      userId: payload.userId,
      code,
      redirectUri: env.META_REDIRECT_URI,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error(`[meta] code exchange / store failed: ${message}`);
    return fail("exchange_failed");
  }

  const successUrl = new URL(adminBase);
  successUrl.searchParams.set("connected", "1");
  return NextResponse.redirect(successUrl.toString(), { status: 302 });
}
