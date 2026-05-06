import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { mapMetaIntegrationRow } from "@/features/integrations/meta/server/map-row";
import type { MetaIntegration } from "@/features/integrations/meta/types";

const SELECT_COLUMNS =
  "id, user_id, meta_user_id, instagram_business_account_id, facebook_page_id, facebook_page_name, access_token, token_expires_at, granted_scopes, last_refreshed_at, status, error_details, created_at, updated_at";

/**
 * Marks the integration as 'revoked' instead of deleting the row,
 * so the audit trail (when it was first connected, by which user)
 * stays intact. Phase 2 scrapers must check `status === 'active'`
 * before using the token.
 *
 * Note: this does NOT call Meta to revoke the token on their side.
 * To fully invalidate, the user has to remove the app from their
 * Facebook Settings → Business Integrations. We surface that
 * instruction in the admin UI confirmation copy.
 */
export async function revokeIntegration(integrationId: string): Promise<MetaIntegration> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("meta_integrations")
    .update({
      status: "revoked",
      error_details: { revokedAt: new Date().toISOString() },
    })
    .eq("id", integrationId)
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(`Unable to revoke Meta integration: ${error?.message ?? "no row"}`);
  }
  return mapMetaIntegrationRow(data);
}
