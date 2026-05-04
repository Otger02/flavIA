import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { mapVerificationRow } from "@/features/professional-verification/server/map-row";
import type { ProfessionalVerification } from "@/features/professional-verification/types";

/**
 * Reads the calling user's own verification row (if any). RLS scopes
 * the read; failure to load returns null rather than throwing — the
 * form / status pages render a "no request yet" state when null.
 */
export async function getOwnVerification(
  userId: string,
): Promise<ProfessionalVerification | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("professional_verifications")
    .select(
      "id, user_id, professional_type, specialty, full_legal_name, license_number, license_country, bio, linkedin_url, website_url, document_storage_paths, archived_document_paths, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, approved_display_name, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[verification] getOwnVerification failed", error);
    return null;
  }

  return data ? mapVerificationRow(data) : null;
}
