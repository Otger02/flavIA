import "server-only";

import type {
  ProfessionalVerification,
  VerifiedProfessionalPublic,
} from "@/features/professional-verification/types";
import type { Database } from "@/types/db";

type Row = Database["public"]["Tables"]["professional_verifications"]["Row"];

export function mapVerificationRow(row: Row): ProfessionalVerification {
  return {
    id: row.id,
    userId: row.user_id,
    professionalType: row.professional_type,
    specialty: row.specialty,
    fullLegalName: row.full_legal_name,
    licenseNumber: row.license_number,
    licenseCountry: row.license_country,
    bio: row.bio,
    linkedinUrl: row.linkedin_url,
    websiteUrl: row.website_url,
    documentStoragePaths: row.document_storage_paths ?? [],
    archivedDocumentPaths: row.archived_document_paths ?? [],
    status: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    rejectionReason: row.rejection_reason,
    approvedDisplayName: row.approved_display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Strips any field that should never reach the public client
 * (legal name, license number, document paths, status timestamps for
 * rejection/audit etc.). Uses approved_display_name when set, falls
 * back to legal name only because the verified_professionals view
 * already does the same coalesce server-side; this helper exists for
 * the rare case we need to project from the full row in code.
 */
export function toPublicProfessional(
  row: ProfessionalVerification,
): VerifiedProfessionalPublic {
  return {
    userId: row.userId,
    professionalType: row.professionalType,
    specialty: row.specialty,
    bio: row.bio,
    linkedinUrl: row.linkedinUrl,
    websiteUrl: row.websiteUrl,
    displayName: row.approvedDisplayName ?? row.fullLegalName,
    approvedAt: row.reviewedAt,
  };
}
