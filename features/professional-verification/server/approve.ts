import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
} from "@/features/professional-verification/server/send-email";
import { mapVerificationRow } from "@/features/professional-verification/server/map-row";
import type { ProfessionalVerification } from "@/features/professional-verification/types";

type ApproveParams = {
  verificationId: string;
  adminUserId: string;
  approvedDisplayNameOverride?: string | null;
};

type DecisionResult =
  | { ok: true; verification: ProfessionalVerification }
  | { ok: false; error: string };

const SELECT_COLUMNS =
  "id, user_id, professional_type, specialty, full_legal_name, license_number, license_country, bio, linkedin_url, website_url, document_storage_paths, archived_document_paths, status, submitted_at, reviewed_at, reviewed_by, rejection_reason, approved_display_name, created_at, updated_at";

export async function approveVerification({
  verificationId,
  adminUserId,
  approvedDisplayNameOverride,
}: ApproveParams): Promise<DecisionResult> {
  const supabase = createAdminSupabaseClient();

  const update: Record<string, unknown> = {
    status: "approved",
    reviewed_at: new Date().toISOString(),
    reviewed_by: adminUserId,
    rejection_reason: null,
  };
  if (approvedDisplayNameOverride !== undefined) {
    update.approved_display_name = approvedDisplayNameOverride;
  }

  const { data, error } = await supabase
    .from("professional_verifications")
    .update(update)
    .eq("id", verificationId)
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "approve_failed" };
  }

  const verification = mapVerificationRow(data);

  await supabase.from("professional_verification_audit").insert({
    verification_id: verification.id,
    admin_user_id: adminUserId,
    action: "approved",
    notes: null,
  });

  // Email is best-effort. Failure logged, never thrown.
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", verification.userId)
      .maybeSingle();
    const userEmail = (profile?.email as string | null) ?? null;
    if (userEmail) {
      await sendVerificationApprovedEmail({ userEmail, verification });
    }
  } catch (err) {
    console.warn("[verification] approve email failed", err);
  }

  return { ok: true, verification };
}

type RejectParams = {
  verificationId: string;
  adminUserId: string;
  reason: string;
};

export async function rejectVerification({
  verificationId,
  adminUserId,
  reason,
}: RejectParams): Promise<DecisionResult> {
  const trimmed = reason.trim();
  if (trimmed.length < 4 || trimmed.length > 500) {
    return { ok: false, error: "invalid_reason_length" };
  }

  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("professional_verifications")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUserId,
      rejection_reason: trimmed,
    })
    .eq("id", verificationId)
    .select(SELECT_COLUMNS)
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "reject_failed" };
  }

  const verification = mapVerificationRow(data);

  await supabase.from("professional_verification_audit").insert({
    verification_id: verification.id,
    admin_user_id: adminUserId,
    action: "rejected",
    notes: trimmed,
  });

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", verification.userId)
      .maybeSingle();
    const userEmail = (profile?.email as string | null) ?? null;
    if (userEmail) {
      await sendVerificationRejectedEmail({ userEmail, verification });
    }
  } catch (err) {
    console.warn("[verification] reject email failed", err);
  }

  return { ok: true, verification };
}
