import "server-only";

import { getServerEnv } from "@/lib/env";

const GRAPH_API_VERSION = "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Server-only wrappers around the Meta Graph API endpoints needed
 * for OAuth + token lifecycle. Phase 2 scraping helpers live in
 * `features/integrations/meta/server/scrapers/`.
 *
 * Every function returns a typed result or throws with a descriptive
 * message — callers should wrap in try/catch and log.
 */

function getMetaAppCredentials(): { appId: string; appSecret: string } {
  const env = getServerEnv();
  if (!env.META_APP_ID || !env.META_APP_SECRET) {
    throw new Error("META_APP_ID and META_APP_SECRET must be set before using the Graph API.");
  }
  return { appId: env.META_APP_ID, appSecret: env.META_APP_SECRET };
}

async function fetchGraph<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    // Always go to origin — never cache OAuth / token responses.
    cache: "no-store",
  });
  const text = await response.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`Meta Graph API returned non-JSON: ${text.slice(0, 200)}`);
  }
  if (!response.ok) {
    const errMessage =
      (json && typeof json === "object" && "error" in json && (json as { error?: { message?: string } }).error?.message) ||
      `Meta Graph API ${response.status}`;
    throw new Error(`Meta Graph API error: ${errMessage}`);
  }
  return json as T;
}

/**
 * Step 1 of token exchange — turn the OAuth `code` into a
 * short-lived (~1-2 hour) user access token.
 */
export async function exchangeCodeForShortLivedToken(params: {
  code: string;
  redirectUri: string;
}): Promise<{ accessToken: string; expiresInSeconds: number }> {
  const { appId, appSecret } = getMetaAppCredentials();
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("code", params.code);

  const json = await fetchGraph<{
    access_token: string;
    token_type?: string;
    expires_in?: number;
  }>(url.toString());

  if (!json.access_token) {
    throw new Error("Meta did not return access_token on code exchange.");
  }

  return {
    accessToken: json.access_token,
    expiresInSeconds: json.expires_in ?? 3600,
  };
}

/**
 * Step 2 — exchange a short-lived token for a long-lived one
 * (~60 days). The same endpoint also acts as the refresh path
 * when called with a still-valid long-lived token.
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
): Promise<{ accessToken: string; expiresInSeconds: number }> {
  const { appId, appSecret } = getMetaAppCredentials();
  const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("client_secret", appSecret);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const json = await fetchGraph<{
    access_token: string;
    expires_in?: number;
    token_type?: string;
  }>(url.toString());

  if (!json.access_token) {
    throw new Error("Meta did not return access_token on long-lived exchange.");
  }

  return {
    accessToken: json.access_token,
    // Default to 60 days if Meta omits the field.
    expiresInSeconds: json.expires_in ?? 60 * 24 * 60 * 60,
  };
}

/**
 * Returns basic info about the user that the access token belongs to.
 * Used during OAuth callback to populate `meta_user_id`.
 */
export async function fetchMetaUserId(accessToken: string): Promise<string> {
  const url = new URL(`${GRAPH_BASE}/me`);
  url.searchParams.set("fields", "id,name");
  url.searchParams.set("access_token", accessToken);
  const json = await fetchGraph<{ id: string; name?: string }>(url.toString());
  if (!json.id) {
    throw new Error("Meta /me did not return an id.");
  }
  return json.id;
}

export type ConnectedPage = {
  id: string;
  name: string;
  instagramBusinessAccountId: string | null;
};

/**
 * Lists the FB Pages this user manages and resolves the connected
 * Instagram Business Account ID for each. Returns the first page
 * (Flavia is expected to have exactly one).
 */
export async function fetchPrimaryConnectedPage(
  accessToken: string,
): Promise<ConnectedPage | null> {
  const url = new URL(`${GRAPH_BASE}/me/accounts`);
  url.searchParams.set("fields", "id,name,instagram_business_account");
  url.searchParams.set("access_token", accessToken);
  const json = await fetchGraph<{
    data?: Array<{
      id: string;
      name: string;
      instagram_business_account?: { id: string };
    }>;
  }>(url.toString());

  const first = json.data?.[0];
  if (!first) return null;
  return {
    id: first.id,
    name: first.name,
    instagramBusinessAccountId: first.instagram_business_account?.id ?? null,
  };
}

/**
 * Best-effort scope inspection. Calls /debug_token for the access
 * token using the app access token (app_id|app_secret). Returns the
 * granted scopes string array or [] on failure.
 */
export async function fetchGrantedScopes(accessToken: string): Promise<string[]> {
  try {
    const { appId, appSecret } = getMetaAppCredentials();
    const url = new URL(`${GRAPH_BASE}/debug_token`);
    url.searchParams.set("input_token", accessToken);
    url.searchParams.set("access_token", `${appId}|${appSecret}`);
    const json = await fetchGraph<{
      data?: { scopes?: string[]; expires_at?: number };
    }>(url.toString());
    return json.data?.scopes ?? [];
  } catch (err) {
    console.warn("[meta] fetchGrantedScopes failed", err);
    return [];
  }
}
