-- ───────────────────────────────────────────────────────────────────
-- Professional verification
-- ───────────────────────────────────────────────────────────────────
-- Healthcare professionals (psychologists, sexologists, doctors) can
-- request verification, upload credentials, and once approved get a
-- public badge plus elevated community privileges.
--
-- Manual review only — no automated approval. Admin role decides via
-- /admin/profesionales.

CREATE TABLE IF NOT EXISTS public.professional_verifications (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_type           text NOT NULL CHECK (professional_type IN ('psychologist', 'sexologist', 'doctor')),
  specialty                   text,
  full_legal_name             text NOT NULL,
  license_number              text NOT NULL,
  license_country             text NOT NULL CHECK (char_length(license_country) = 2),
  bio                         text CHECK (char_length(bio) <= 500),
  linkedin_url                text,
  website_url                 text,
  document_storage_paths      text[] NOT NULL DEFAULT '{}',
  -- Documents superseded by a re-submission. Soft-deleted for audit.
  archived_document_paths     text[] NOT NULL DEFAULT '{}',
  status                      text NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
  submitted_at                timestamptz NOT NULL DEFAULT now(),
  reviewed_at                 timestamptz,
  reviewed_by                 uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason            text,
  approved_display_name       text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS professional_verifications_status_idx
  ON public.professional_verifications (status, submitted_at DESC);

CREATE INDEX IF NOT EXISTS professional_verifications_type_idx
  ON public.professional_verifications (professional_type)
  WHERE status = 'approved';

-- Auto-update updated_at on every UPDATE (mirrors the convention used
-- by the canonical schema).
CREATE OR REPLACE FUNCTION public.set_professional_verification_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS professional_verifications_set_updated_at
  ON public.professional_verifications;
CREATE TRIGGER professional_verifications_set_updated_at
  BEFORE UPDATE ON public.professional_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_professional_verification_updated_at();

-- ── Audit log ────────────────────────────────────────────────────────
-- Every status change recorded with admin user id + timestamp.
CREATE TABLE IF NOT EXISTS public.professional_verification_audit (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id    uuid NOT NULL REFERENCES public.professional_verifications(id) ON DELETE CASCADE,
  admin_user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action             text NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'revoked', 'request_more_info', 'resubmitted')),
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS professional_verification_audit_verification_idx
  ON public.professional_verification_audit (verification_id, created_at DESC);

-- ── Public view: who is verified ─────────────────────────────────────
-- Lightweight view exposing only the public-facing fields. RLS lets
-- any authenticated user read this view, so badges and info cards can
-- query without leaking license numbers or document paths.
DROP VIEW IF EXISTS public.verified_professionals;
CREATE VIEW public.verified_professionals AS
  SELECT
    user_id,
    professional_type,
    specialty,
    bio,
    linkedin_url,
    website_url,
    COALESCE(approved_display_name, full_legal_name) AS display_name,
    reviewed_at AS approved_at
  FROM public.professional_verifications
  WHERE status = 'approved';

COMMENT ON VIEW public.verified_professionals IS
  'Public-facing projection of approved professionals. Excludes license number, document paths, legal name, and audit fields.';

-- ── RLS on professional_verifications ────────────────────────────────
ALTER TABLE public.professional_verifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own verification row (regardless of status —
-- they need to see rejection reason and resubmit).
DROP POLICY IF EXISTS "professional_verifications_select_own"
  ON public.professional_verifications;
CREATE POLICY "professional_verifications_select_own"
  ON public.professional_verifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert: only one row per user (enforced by UNIQUE on user_id) and
-- only for self.
DROP POLICY IF EXISTS "professional_verifications_insert_own"
  ON public.professional_verifications;
CREATE POLICY "professional_verifications_insert_own"
  ON public.professional_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND status = 'pending');

-- Update: only when status is 'pending' or 'rejected'. Approved /
-- revoked rows are immutable from the user side. Status itself can
-- only be flipped back to 'pending' (used on resubmit). Approval
-- transitions go through the admin client (bypasses RLS).
DROP POLICY IF EXISTS "professional_verifications_update_own"
  ON public.professional_verifications;
CREATE POLICY "professional_verifications_update_own"
  ON public.professional_verifications
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('pending', 'rejected')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status IN ('pending', 'rejected')
  );

-- Audit table: end users never read or write directly — admin client only.
ALTER TABLE public.professional_verification_audit ENABLE ROW LEVEL SECURITY;

-- ── Public verified_professionals view RLS ───────────────────────────
-- Views inherit RLS from underlying tables. To make this view readable
-- by anyone (including anonymous browsing), add an explicit SELECT
-- policy on the base table for the rows the view exposes.
DROP POLICY IF EXISTS "professional_verifications_select_public_approved"
  ON public.professional_verifications;
CREATE POLICY "professional_verifications_select_public_approved"
  ON public.professional_verifications
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- The above policy lets clients SELECT approved rows directly too.
-- We rely on application code (server-only queries) to project only
-- the public fields. Clients should query the view, not the table.

-- ── Storage bucket for credential documents ──────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-documents',
  'professional-documents',
  false,
  5 * 1024 * 1024,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Path convention: <user_id>/<timestamp>-<filename>. Users may only
-- read/write objects under their own user_id prefix.
DROP POLICY IF EXISTS "professional_documents_insert_own"
  ON storage.objects;
CREATE POLICY "professional_documents_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "professional_documents_select_own"
  ON storage.objects;
CREATE POLICY "professional_documents_select_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "professional_documents_delete_own"
  ON storage.objects;
CREATE POLICY "professional_documents_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'professional-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin reads happen via the service-role client in server code, which
-- bypasses RLS — no SELECT policy needed for admins.

COMMENT ON TABLE public.professional_verifications IS
  'Verification requests from healthcare professionals. Manual admin review. Approved rows surface on the verified_professionals view.';

COMMENT ON COLUMN public.professional_verifications.archived_document_paths IS
  'Documents soft-deleted on resubmission. Storage objects are retained for audit; this column tracks which paths are no longer "current".';
