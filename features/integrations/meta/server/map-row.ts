import "server-only";

import type {
  MetaIntegration,
  MetaIntegrationPublic,
} from "@/features/integrations/meta/types";
import type { Database } from "@/types/db";

type Row = Database["public"]["Tables"]["meta_integrations"]["Row"];

export function mapMetaIntegrationRow(row: Row): MetaIntegration {
  return {
    id: row.id,
    userId: row.user_id,
    metaUserId: row.meta_user_id,
    instagramBusinessAccountId: row.instagram_business_account_id,
    facebookPageId: row.facebook_page_id,
    facebookPageName: row.facebook_page_name,
    accessToken: row.access_token,
    tokenExpiresAt: row.token_expires_at,
    grantedScopes: row.granted_scopes ?? [],
    lastRefreshedAt: row.last_refreshed_at,
    status: row.status,
    errorDetails: row.error_details,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPublicIntegration(integration: MetaIntegration): MetaIntegrationPublic {
  // Strip the access token. Everything else is safe for the admin UI.
  const { accessToken: _accessToken, ...rest } = integration;
  void _accessToken;
  return rest;
}
