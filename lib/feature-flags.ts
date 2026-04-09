/**
 * Feature flags for gating unreleased features.
 * Toggle via environment variables — no code deploy required on Vercel.
 */

export function isCommunityEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_COMMUNITY === "true";
}
