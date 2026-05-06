import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  fetchGrantedScopes,
  fetchMetaUserId,
  fetchPrimaryConnectedPage,
} from "@/features/integrations/meta/server/graph-api";
import { mapMetaIntegrationRow } from "@/features/integrations/meta/server/map-row";
import type { MetaIntegration } from "@/features/integrations/meta/types";

const SELECT_COLUMNS =
  "id, user_id, meta_user_id, instagram_business_account_id, facebook_page_id, facebook_page_name, access_token, token_expires_at, granted_scopes, last_refreshed_at, status, error_details, created_at, updated_at";

type Params = {
  userId: string;
  code: string;
  redirectUri: string;
};

/**
 * Full OAuth code → integration row flow.
 *
 *   1. Exchange code for short-lived token
 *   2. Promote to long-lived (~60 day) token
 *   3. Fetch the Meta user id, connected FB Page + IG Business Account
 *   4. Fetch granted scopes (best-effort)
 *   5. Upsert into meta_integrations (one row per user_id)
 *
 * Throws on any step failure. Caller (the OAuth callback) maps the
 * error to a redirect with a generic error code — never expose the
 * upstream Meta message to the browser.
 */
export async function exchangeCodeAndStoreIntegration(
  params: Params,
): Promise<MetaIntegration> {
  const shortLived = await exchangeCodeForShortLivedToken({
    code: params.code,
    redirectUri: params.redirectUri,
  });
  const longLived = await exchangeForLongLivedToken(shortLived.accessToken);

  const metaUserId = await fetchMetaUserId(longLived.accessToken);
  const page = await fetchPrimaryConnectedPage(longLived.accessToken);
  const grantedScopes = await fetchGrantedScopes(longLived.accessToken);

  const expiresAt = new Date(Date.now() + longLived.expiresInSeconds * 1000).toISOString();

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("meta_integrations")
    .upsert(
      {
        user_id: params.userId,
        meta_user_id: metaUserId,
        instagram_business_account_id: page?.instagramBusinessAccountId ?? null,
        facebook_page_id: page?.id ?? null,
        facebook_page_name: page?.name ?? null,
        access_token: longLived.accessToken,
        token_expires_at: expiresAt,
        granted_scopes: grantedScopes,
        last_refreshed_at: new Date().toISOString(),
        status: "active",
        error_details: null,
      },
      { onConflict: "user_id" },
    )
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(`Unable to store Meta integration: ${error?.message ?? "no row"}`);
  }

  return mapMetaIntegrationRow(data);
}
