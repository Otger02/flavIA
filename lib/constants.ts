/**
 * Admin access is gated by email.
 * Set ADMIN_EMAILS env var as a comma-separated list to override without
 * touching code. Falls back to the hardcoded value if the var is absent
 * so local dev works out of the box.
 *
 * Example: ADMIN_EMAILS="admin@flavia.app,otger02@gmail.com"
 */
const _adminEmailsEnv = process.env.ADMIN_EMAILS?.trim();
export const ADMIN_EMAILS: string[] = _adminEmailsEnv
  ? _adminEmailsEnv.split(",").map((e) => e.trim()).filter(Boolean)
  : ["otger02@gmail.com"];
