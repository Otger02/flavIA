import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { getServerEnv } from "@/lib/env";
import {
  STATE_TTL_SECONDS,
  type OAuthStatePayload,
} from "@/features/integrations/meta/types";

/**
 * HMAC-signed state parameter for the Meta OAuth round trip. Format:
 *   <base64url(JSON payload)>.<base64url(HMAC-SHA256)>
 *
 * Verifies signature, payload shape, and TTL. Throws on any failure
 * — caller should map the error to a 400 redirect, never expose the
 * internal reason to the browser.
 */

function base64UrlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Buffer {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(normalized, "base64");
}

function getSecret(): Buffer {
  const env = getServerEnv();
  const secret = env.INTEGRATIONS_SIGNING_SECRET;
  if (!secret) {
    throw new Error(
      "INTEGRATIONS_SIGNING_SECRET is not set — the Meta OAuth flow cannot sign or verify state.",
    );
  }
  return Buffer.from(secret, "utf8");
}

export function signOAuthState(userId: string): string {
  const payload: OAuthStatePayload = {
    userId,
    nonce: randomBytes(16).toString("hex"),
    iat: Math.floor(Date.now() / 1000),
  };
  const body = base64UrlEncode(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = createHmac("sha256", getSecret()).update(body).digest();
  return `${body}.${base64UrlEncode(sig)}`;
}

export function verifyOAuthState(state: string): OAuthStatePayload {
  const parts = state.split(".");
  if (parts.length !== 2) {
    throw new Error("Malformed OAuth state");
  }
  const [body, sig] = parts;

  const expected = createHmac("sha256", getSecret()).update(body).digest();
  const provided = base64UrlDecode(sig);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) {
    throw new Error("OAuth state signature mismatch");
  }

  let payload: OAuthStatePayload;
  try {
    const json = base64UrlDecode(body).toString("utf8");
    payload = JSON.parse(json) as OAuthStatePayload;
  } catch {
    throw new Error("OAuth state payload is not valid JSON");
  }

  if (
    typeof payload !== "object" ||
    typeof payload.userId !== "string" ||
    typeof payload.nonce !== "string" ||
    typeof payload.iat !== "number"
  ) {
    throw new Error("OAuth state payload missing required fields");
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - payload.iat;
  if (ageSeconds < 0 || ageSeconds > STATE_TTL_SECONDS) {
    throw new Error("OAuth state expired");
  }

  return payload;
}
