import "server-only";

import { ADMIN_EMAILS } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getOwnVerification } from "@/features/professional-verification/server/get-own-status";
import { mapVerificationRow } from "@/features/professional-verification/server/map-row";
import { sendVerificationSubmittedEmails } from "@/features/professional-verification/server/send-email";
import {
  submitVerificationInputSchema,
  type ProfessionalVerification,
  type SubmitVerificationInput,
} from "@/features/professional-verification/types";

type SubmitParams = {
  userId: string;
  userEmail: string | null;
  input: SubmitVerificationInput;
};

type SubmitResult =
  | { ok: true; verification: ProfessionalVerification }
  | { ok: false; error: string };

/**
 * Submit (or resubmit after rejection) a verification request.
 *
 * Rules enforced beyond Zod:
 *   - One row per user. Existing approved/revoked rows can't be touched
 *     from here — those need admin intervention.
 *   - Resubmit: rejected → pending. Old document paths are moved to
 *     `archived_document_paths` so they're retained for audit.
 *
 * Storage uploads happen client-side via the user's authenticated
 * Supabase client before this is called. The paths are passed in.
 */
export async function submitVerificationRequest({
  userId,
  userEmail,
  input,
}: SubmitParams): Promise<SubmitResult> {
  const parsed = submitVerificationInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_payload" };
  }
  const data = parsed.data;

  const existing = await getOwnVerification(userId);
  if (existing && existing.status === "approved") {
    return { ok: false, error: "already_approved" };
  }
  if (existing && existing.status === "revoked") {
    return { ok: false, error: "revoked_contact_admin" };
  }

  const supabase = await createServerSupabaseClient();
  const payload = {
    user_id: userId,
    professional_type: data.professionalType,
    specialty: data.specialty || null,
    full_legal_name: data.fullLegalName,
    license_number: data.licenseNumber,
    license_country: data.licenseCountry,
    bio: data.bio || null,
    linkedin_url: data.linkedinUrl || null,
    website_url: data.websiteUrl || null,
    approved_display_name: data.approvedDisplayName || null,
    document_storage_paths: data.documentStoragePaths,
    status: "pending" as const,
    submitted_at: new Date().toISOString(),
    rejection_reason: null,
    reviewed_at: null,
    reviewed_by: null,
  };

  let row;
  let auditAction: "submitted" | "resubmitted" = "submitted";
  if (existing) {
    auditAction = "resubmitted";
    const archivedPaths = Array.from(
      new Set([...existing.archivedDocumentPaths, ...existing.documentStoragePaths]),
    );
    const result = await supabase
      .from("professional_verifications")
      .update({
        ...payload,
        archived_document_paths: archivedPaths,
      })
      .eq("user_id", userId)
      .in("status", ["pending", "rejected"])
      .select(
        "id, user_id, professional_type, specialty, full_legal_name, license_number, license_country, bio, linkedin_url, website_url, document_storage_paths, archived_document_paths, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, approved_display_name, created_at, updated_at",
      )
      .single();

    if (result.error || !result.data) {
      return { ok: false, error: result.error?.message ?? "update_failed" };
    }
    row = result.data;
  } else {
    const result = await supabase
      .from("professional_verifications")
      .insert(payload)
      .select(
        "id, user_id, professional_type, specialty, full_legal_name, license_number, license_country, bio, linkedin_url, website_url, document_storage_paths, archived_document_paths, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, approved_display_name, created_at, updated_at",
      )
      .single();

    if (result.error || !result.data) {
      return { ok: false, error: result.error?.message ?? "insert_failed" };
    }
    row = result.data;
  }

  const verification = mapVerificationRow(row);

  // Audit log via admin client (RLS prevents end-user writes).
  const adminClient = createAdminSupabaseClient();
  await adminClient.from("professional_verification_audit").insert({
    verification_id: verification.id,
    admin_user_id: null,
    action: auditAction,
    notes: null,
  });

  // Notify admins + acknowledge user. Email failures are non-fatal.
  await sendVerificationSubmittedEmails({
    userEmail,
    verification,
    adminEmails: ADMIN_EMAILS,
  }).catch((error) => {
    console.warn("[verification] submitted email dispatch failed", error);
  });

  return { ok: true, verification };
}
