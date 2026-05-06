import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_EMAILS } from "@/lib/constants";
import { getServerEnv } from "@/lib/env";
import { getUser } from "@/features/auth/server/get-user";
import { signOAuthState } from "@/features/integrations/meta/server/sign-state";
import { META_OAUTH_SCOPES } from "@/features/integrations/meta/types";

export const runtime = "nodejs";

const META_OAUTH_BASE = "https://www.facebook.com/v21.0/dialog/oauth";

/**
 * Admin-only kickoff for the Meta OAuth flow. Only an admin can start
 * the flow because the resulting integration is bound to that admin's
 * `user_id` (so the row is queryable + revocable from /admin/integraciones).
 *
 * This route doesn't itself perform the OAuth; it builds the Meta auth
 * URL with a CSRF-resistant signed `state` and 302-redirects the
 * browser there.
 */
export async function GET(_request: NextRequest) {
  const user = await getUser();
  if (!user || !user.email || !ADMIN_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const env = getServerEnv();
  if (!env.META_APP_ID || !env.META_REDIRECT_URI || !env.INTEGRATIONS_SIGNING_SECRET) {
    return NextResponse.json(
      {
        error:
          "Meta integration is not configured. Set META_APP_ID, META_REDIRECT_URI and INTEGRATIONS_SIGNING_SECRET in .env.local first.",
      },
      { status: 503 },
    );
  }

  const state = signOAuthState(user.id);

  const url = new URL(META_OAUTH_BASE);
  url.searchParams.set("client_id", env.META_APP_ID);
  url.searchParams.set("redirect_uri", env.META_REDIRECT_URI);
  url.searchParams.set("scope", META_OAUTH_SCOPES.join(","));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);

  return NextResponse.redirect(url.toString(), { status: 302 });
}
