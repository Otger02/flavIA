import { z } from "zod";

export const PROFESSIONAL_TYPES = ["psychologist", "sexologist", "doctor"] as const;
export const VERIFICATION_STATUSES = ["pending", "approved", "rejected", "revoked"] as const;

export const professionalTypeSchema = z.enum(PROFESSIONAL_TYPES);
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES);

export const submitVerificationInputSchema = z.object({
  professionalType: professionalTypeSchema,
  specialty: z.string().trim().max(80).optional().nullable(),
  fullLegalName: z.string().trim().min(2).max(120),
  licenseNumber: z.string().trim().min(1).max(80),
  licenseCountry: z
    .string()
    .trim()
    .length(2, "ISO 3166-1 alpha-2 code expected")
    .toUpperCase(),
  bio: z.string().trim().max(500).optional().nullable(),
  linkedinUrl: z
    .string()
    .trim()
    .url()
    .max(300)
    .optional()
    .nullable()
    .or(z.literal("")),
  websiteUrl: z
    .string()
    .trim()
    .url()
    .max(300)
    .optional()
    .nullable()
    .or(z.literal("")),
  approvedDisplayName: z.string().trim().min(2).max(120).optional().nullable(),
  documentStoragePaths: z.array(z.string().min(1)).min(1).max(8),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationInputSchema>;
export type ProfessionalType = z.infer<typeof professionalTypeSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export type ProfessionalVerification = {
  id: string;
  userId: string;
  professionalType: ProfessionalType;
  specialty: string | null;
  fullLegalName: string;
  licenseNumber: string;
  licenseCountry: string;
  bio: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  documentStoragePaths: string[];
  archivedDocumentPaths: string[];
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  approvedDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Public-facing slim view of an approved professional. Excludes any
 * sensitive field (legal name, license number, document paths). Used by
 * badges and public info cards.
 */
export type VerifiedProfessionalPublic = {
  userId: string;
  professionalType: ProfessionalType;
  specialty: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  displayName: string;
  approvedAt: string | null;
};

export const PROFESSIONAL_DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const PROFESSIONAL_DOCUMENT_ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;
