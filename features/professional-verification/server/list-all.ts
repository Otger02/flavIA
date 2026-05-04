import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { mapVerificationRow } from "@/features/professional-verification/server/map-row";
import type {
  ProfessionalType,
  ProfessionalVerification,
  VerificationStatus,
} from "@/features/professional-verification/types";

type ListFilters = {
  status?: VerificationStatus | null;
  professionalType?: ProfessionalType | null;
  limit?: number;
};

export type AdminVerificationRow = ProfessionalVerification & {
  userEmail: string | null;
};

/**
 * Admin-only. Uses the admin Supabase client (service role) to bypass
 * RLS and read all verification rows + the matching profile email.
 *
 * MUST only be called from server code that has already gated access
 * via `requireAdmin()`.
 */
export async function listAllVerifications(
  filters: ListFilters = {},
): Promise<AdminVerificationRow[]> {
  const supabase = createAdminSupabaseClient();
  let query = supabase
    .from("professional_verifications")
    .select(
      "id, user_id, professional_type, specialty, full_legal_name, license_number, license_country, bio, linkedin_url, website_url, document_storage_paths, archived_document_paths, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, approved_display_name, created_at, updated_at",
    )
    .order("status", { ascending: true }) // pending first alphabetically
    .order("submitted_at", { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.professionalType) {
    query = query.eq("professional_type", filters.professionalType);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`Unable to list verifications: ${error.message}`);
  }

  const rows = (data ?? []).map(mapVerificationRow);
  if (rows.length === 0) return [];

  // Fetch matching emails via the profiles table in one shot.
  const userIds = Array.from(new Set(rows.map((r) => r.userId)));
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email")
    .in("id", userIds);

  const emailByUser = new Map<string, string | null>();
  for (const p of profiles ?? []) {
    emailByUser.set(p.id, (p.email as string | null) ?? null);
  }

  return rows.map((r) => ({ ...r, userEmail: emailByUser.get(r.userId) ?? null }));
}

export async function getVerificationByIdForAdmin(
  id: string,
): Promise<AdminVerificationRow | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("professional_verifications")
    .select(
      "id, user_id, professional_type, specialty, full_legal_name, license_number, license_country, bio, linkedin_url, website_url, document_storage_paths, archived_document_paths, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, approved_display_name, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load verification: ${error.message}`);
  }
  if (!data) return null;

  const row = mapVerificationRow(data);
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", row.userId)
    .maybeSingle();

  return { ...row, userEmail: (profile?.email as string | null) ?? null };
}

/**
 * Generates short-lived signed URLs for the document_storage_paths so
 * the admin review UI can preview/download them. Default TTL is 5
 * minutes — admins refresh by reloading the page.
 */
export async function getSignedDocumentUrls(
  paths: string[],
  ttlSeconds = 300,
): Promise<Array<{ path: string; signedUrl: string | null }>> {
  if (paths.length === 0) return [];
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.storage
    .from("professional-documents")
    .createSignedUrls(paths, ttlSeconds);

  if (error) {
    console.error("[verification] createSignedUrls failed", error);
    return paths.map((p) => ({ path: p, signedUrl: null }));
  }

  return (data ?? []).map((entry) => ({
    path: entry.path ?? "",
    signedUrl: entry.signedUrl ?? null,
  }));
}
