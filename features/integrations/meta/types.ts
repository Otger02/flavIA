import { z } from "zod";

/**
 * Scopes requested during the OAuth flow. The exact set Flavia approved.
 * Keep in sync with the redirect URI configuration in the Meta dashboard.
 */
export const META_OAUTH_SCOPES = [
  "instagram_basic",
  "instagram_manage_comments",
  "pages_show_list",
  "pages_read_engagement",
  "business_management",
] as const;

export type MetaOAuthScope = (typeof META_OAUTH_SCOPES)[number];

export const integrationStatusSchema = z.enum(["active", "revoked", "expired", "error"]);
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;

export type MetaIntegration = {
  id: string;
  userId: string;
  metaUserId: string;
  instagramBusinessAccountId: string | null;
  facebookPageId: string | null;
  facebookPageName: string | null;
  /**
   * The long-lived FB user access token. Server-only — never expose to
   * the client. Reads happen through the admin Supabase client.
   */
  accessToken: string;
  tokenExpiresAt: string | null;
  grantedScopes: string[];
  lastRefreshedAt: string | null;
  status: IntegrationStatus;
  errorDetails: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Public-safe projection used by the admin UI. Strips the access token
 * and any other field that would leak credentials to the browser.
 */
export type MetaIntegrationPublic = Omit<MetaIntegration, "accessToken">;

export type TokenInfo = {
  accessToken: string;
  /** Seconds until the token expires, as returned by Meta. */
  expiresInSeconds: number;
};

/**
 * State payload signed and round-tripped through the OAuth flow.
 * `userId` lets the callback bind the resulting integration to the
 * admin who started the flow, even if the FB session belongs to
 * Flavia (a different person). `nonce` defends against replay.
 */
export type OAuthStatePayload = {
  userId: string;
  nonce: string;
  /** Issued-at as unix seconds. State expires after 10 minutes. */
  iat: number;
};

export const STATE_TTL_SECONDS = 10 * 60;
export const TOKEN_REFRESH_THRESHOLD_DAYS = 7;
