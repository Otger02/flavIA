import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Resend, type CreateEmailOptions } from "resend";

/**
 * Central Resend wrapper. Every outbound email in the app goes through
 * `sendEmailWithRetry()` so the retry + Sentry-capture behaviour is
 * inherited automatically — no individual call site repeats it.
 *
 * Retry policy:
 *   - 3 attempts total
 *   - exponential backoff: 500ms, 1000ms, 2000ms between attempts
 *   - covers transient 5xx, network blips, Resend's own rate limits
 *
 * On final failure:
 *   - `console.error` so the failure shows up in server logs
 *   - `Sentry.captureException` with the email subject + recipient
 *     count + retry attempts as `extra`. Recipients themselves are NOT
 *     sent to Sentry (sentry.server.config.ts has sendDefaultPii=false
 *     and email addresses are PII).
 *   - Returns a result object — does NOT throw. Callers can keep
 *     treating email sends as best-effort without their own try/catch.
 *     Sentry now ensures even "silenced" failures are tracked.
 *
 * Why the result object and not a throw: the existing call sites all
 * silently swallow failures (best-effort emails should never break a
 * main flow like checkout completion). Returning a result preserves
 * that contract; Sentry capture replaces "silent loss" with
 * "tracked but non-fatal".
 */

const FROM_DEFAULT =
  process.env.RESEND_FROM_EMAIL ?? "Flavia <noreply@flavia.app>";
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500; // 500ms → 1000ms → 2000ms

let cachedClient: Resend | null | undefined;

/**
 * Lazy singleton. Reads RESEND_API_KEY once on first call; null if
 * unset (dev environments without email configured).
 */
export function getResendClient(): Resend | null {
  if (cachedClient !== undefined) return cachedClient;
  const key = process.env.RESEND_API_KEY?.trim();
  cachedClient = key ? new Resend(key) : null;
  return cachedClient;
}

export function getDefaultFrom(): string {
  return FROM_DEFAULT;
}

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string; configured: boolean };

type SendContext = {
  /**
   * Short label describing the send site, used for Sentry tags and
   * server log lines. Examples: "welcome", "purchase_confirmation",
   * "verification_submitted_user".
   */
  label: string;
};

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function recipientSummary(to: CreateEmailOptions["to"]): string {
  if (Array.isArray(to)) return `${to.length} recipient(s)`;
  return "1 recipient";
}

export async function sendEmailWithRetry(
  payload: CreateEmailOptions,
  context: SendContext,
): Promise<SendEmailResult> {
  const client = getResendClient();
  if (!client) {
    console.warn(
      `[email] RESEND_API_KEY not configured — skipping (label=${context.label})`,
    );
    return { ok: false, error: "not_configured", configured: false };
  }

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await client.emails.send(payload);
      // The Resend SDK returns { data, error } instead of throwing on
      // some 4xx responses. Treat that case as a failure too.
      const sendError = (response as { error?: unknown }).error;
      if (sendError) {
        lastError = sendError;
      } else {
        const id =
          (response as { data?: { id?: string | null } }).data?.id ?? null;
        if (attempt > 1) {
          console.warn(
            `[email] send succeeded on attempt ${attempt} (label=${context.label})`,
          );
        }
        return { ok: true, id };
      }
    } catch (err) {
      lastError = err;
    }

    if (attempt < MAX_ATTEMPTS) {
      await delay(BASE_DELAY_MS * 2 ** (attempt - 1));
    }
  }

  const errorMessage =
    lastError instanceof Error
      ? lastError.message
      : typeof lastError === "string"
        ? lastError
        : JSON.stringify(lastError ?? "unknown");

  console.error(
    `[email] send failed after ${MAX_ATTEMPTS} attempts (label=${context.label}): ${errorMessage}`,
  );

  // Capture to Sentry — never silence. Wrapped in its own try/catch so a
  // Sentry transport hiccup can't break the request.
  try {
    Sentry.captureException(
      lastError instanceof Error
        ? lastError
        : new Error(`Resend send failed: ${errorMessage}`),
      {
        tags: { source: "resend", label: context.label },
        extra: {
          subject: payload.subject,
          recipients: recipientSummary(payload.to),
          attempts: MAX_ATTEMPTS,
        },
      },
    );
  } catch (sentryErr) {
    console.error(
      "[email] Sentry capture itself failed:",
      sentryErr instanceof Error ? sentryErr.message : sentryErr,
    );
  }

  return { ok: false, error: errorMessage, configured: true };
}
