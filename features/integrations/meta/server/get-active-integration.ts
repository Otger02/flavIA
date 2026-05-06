import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapMetaIntegrationRow } from "@/features/integrations/meta/server/map-row";
import type { MetaIntegration } from "@/features/integrations/meta/types";

const SELECT_COLUMNS =
  "id, user_id, meta_user_id, instagram_business_account_id, facebook_page_id, facebook_page_name, access_token, token_expires_at, granted_scopes, last_refreshed_at, status, error_details, created_at, updated_at";

/**
 * Returns the calling user's own integration row (any status). Reads
 * via the user-scoped Supabase client so RLS enforces ownership.
 */
export async function getOwnIntegration(userId: string): Promise<MetaIntegration | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("meta_integrations")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[meta] getOwnIntegration failed", error);
    return null;
  }
  return data ? mapMetaIntegrationRow(data) : null;
}

/**
 * Admin/cron path. Lists all integrations across users, optionally
 * filtered by status. Bypasses RLS via the service-role client.
 */
export async function listIntegrationsForCron(filters: {
  status?: MetaIntegration["status"];
}): Promise<MetaIntegration[]> {
  const supabase = createAdminSupabaseClient();
  let q = supabase
    .from("meta_integrations")
    .select(SELECT_COLUMNS)
    .order("token_expires_at", { ascending: true });

  if (filters.status) {
    q = q.eq("status", filters.status);
  }

  const { data, error } = await q;
  if (error) {
    throw new Error(`Unable to list Meta integrations: ${error.message}`);
  }
  return (data ?? []).map(mapMetaIntegrationRow);
}

/**
 * Service-role lookup by integration id. Used by the cron + scrapers
 * (phase 2) to load the token for outgoing Graph API calls.
 */
export async function getIntegrationByIdAdmin(id: string): Promise<MetaIntegration | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("meta_integrations")
    .select(SELECT_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load Meta integration: ${error.message}`);
  }
  return data ? mapMetaIntegrationRow(data) : null;
}
