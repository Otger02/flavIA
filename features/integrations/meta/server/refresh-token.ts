import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  exchangeForLongLivedToken,
  fetchGrantedScopes,
} from "@/features/integrations/meta/server/graph-api";
import {
  getIntegrationByIdAdmin,
  listIntegrationsForCron,
} from "@/features/integrations/meta/server/get-active-integration";
import { mapMetaIntegrationRow } from "@/features/integrations/meta/server/map-row";
import {
  TOKEN_REFRESH_THRESHOLD_DAYS,
  type MetaIntegration,
} from "@/features/integrations/meta/types";

const SELECT_COLUMNS =
  "id, user_id, meta_user_id, instagram_business_account_id, facebook_page_id, facebook_page_name, access_token, token_expires_at, granted_scopes, last_refreshed_at, status, error_details, created_at, updated_at";

type RefreshOutcome =
  | { ok: true; integration: MetaIntegration }
  | { ok: false; integrationId: string; reason: string };

/**
 * Refreshes a single integration's long-lived token by exchanging it
 * back through `fb_exchange_token`. Updates status to:
 *   - 'active' on success (with new expires_at + last_refreshed_at)
 *   - 'expired' if the upstream call reports the token can no longer
 *     be refreshed (past 60-day window)
 *   - 'error'  for any other failure (transient network, app
 *     suspension, etc.) with the upstream message in error_details
 */
export async function refreshIntegrationToken(
  integrationId: string,
): Promise<RefreshOutcome> {
  const integration = await getIntegrationByIdAdmin(integrationId);
  if (!integration) {
    return { ok: false, integrationId, reason: "not_found" };
  }
  if (integration.status === "revoked") {
    return { ok: false, integrationId, reason: "revoked" };
  }

  const supabase = createAdminSupabaseClient();

  try {
    const refreshed = await exchangeForLongLivedToken(integration.accessToken);
    const grantedScopes = await fetchGrantedScopes(refreshed.accessToken);
    const expiresAt = new Date(Date.now() + refreshed.expiresInSeconds * 1000).toISOString();

    const { data, error } = await supabase
      .from("meta_integrations")
      .update({
        access_token: refreshed.accessToken,
        token_expires_at: expiresAt,
        granted_scopes: grantedScopes,
        last_refreshed_at: new Date().toISOString(),
        status: "active",
        error_details: null,
      })
      .eq("id", integration.id)
      .select(SELECT_COLUMNS)
      .single();

    if (error || !data) {
      return {
        ok: false,
        integrationId,
        reason: `db_update_failed:${error?.message ?? "no row"}`,
      };
    }

    return { ok: true, integration: mapMetaIntegrationRow(data) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";

    // Heuristic: Meta returns "session has expired" / "OAuthException"
    // when the refresh window has lapsed. Treat as terminal.
    const isTerminal =
      /session has expired|invalid OAuth|reauthorize|expired/i.test(message);

    await supabase
      .from("meta_integrations")
      .update({
        status: isTerminal ? "expired" : "error",
        error_details: { message, when: new Date().toISOString() },
      })
      .eq("id", integration.id);

    return { ok: false, integrationId, reason: message };
  }
}

/**
 * Cron-friendly batch refresh. Picks every active integration whose
 * token expires within `TOKEN_REFRESH_THRESHOLD_DAYS` (default 7) and
 * refreshes them sequentially — failures don't stop later ones.
 */
export async function refreshExpiringTokens(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  outcomes: RefreshOutcome[];
}> {
  const all = await listIntegrationsForCron({ status: "active" });
  const cutoff = Date.now() + TOKEN_REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

  const candidates = all.filter((row) => {
    if (!row.tokenExpiresAt) return true; // unknown expiry — refresh proactively
    return new Date(row.tokenExpiresAt).getTime() <= cutoff;
  });

  const outcomes: RefreshOutcome[] = [];
  for (const row of candidates) {
    const outcome = await refreshIntegrationToken(row.id);
    outcomes.push(outcome);
  }

  return {
    processed: candidates.length,
    succeeded: outcomes.filter((o) => o.ok).length,
    failed: outcomes.filter((o) => !o.ok).length,
    outcomes,
  };
}
