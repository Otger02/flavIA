-- ============================================================
-- Close the 2 ERROR-level advisor lints
-- Source: Supabase Management API security advisor (2026-05-19)
-- See scripts/supabase-advisor-report.md
-- ============================================================
-- Errors addressed:
--   1. security_definer_view on public.verified_professionals
--   2. rls_disabled_in_public on public.community_moderation_log
--
-- Constraints honored:
--   * NO existing policy on professional_verifications is dropped or
--     altered. The three existing policies (select_own, insert_own,
--     update_own) and the public_approved policy stay intact.
--   * community_moderation_log itself is not dropped or altered;
--     only RLS is enabled and an INSERT policy is added.
--   * The verified_professionals view is recreated with the EXACT
--     same SELECT list and ordering as the original migration
--     (20260502_000009_professional_verification.sql lines 81-92).
-- ============================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1. verified_professionals → flip to security_invoker
-- ──────────────────────────────────────────────────────────────────────
-- Why: with the default (SECURITY DEFINER semantics), the view runs
-- under the postgres role and bypasses the caller's RLS on the
-- underlying table. With security_invoker = true, the view evaluates
-- the caller's RLS, which is what we want.
--
-- Why no new policy is needed: the migration that created this view
-- ALREADY granted SELECT on approved rows to both anon and
-- authenticated via the policy
-- `professional_verifications_select_public_approved`. Adding another
-- SELECT policy here would just duplicate it and trigger a
-- `multiple_permissive_policies` warn lint.
--
-- The SELECT list below is copied verbatim from the original
-- migration (line 82-91). Do not edit it in isolation — keep in sync
-- with any future changes to the column projection.

DROP VIEW IF EXISTS public.verified_professionals;

CREATE VIEW public.verified_professionals
  WITH (security_invoker = true)
  AS
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
  'Public-facing projection of approved professionals. Excludes license number, document paths, legal name, and audit fields. Runs as security_invoker — relies on the professional_verifications_select_public_approved policy to surface rows to anon/authenticated callers.';

-- ──────────────────────────────────────────────────────────────────────
-- 2. community_moderation_log → enable RLS with INSERT-only policy
-- ──────────────────────────────────────────────────────────────────────
-- Why: the table is flagged as public + no RLS, which means any
-- authenticated client could SELECT it via PostgREST. We want:
--   * authenticated role: can INSERT (the AI moderation worker runs
--     inside a user request and writes via the user-scoped server
--     client — confirmed in create-thread.ts:68, get-comments.ts:137,
--     generate-flavia-reply.ts:86). NEVER SELECT.
--   * anon role: blocked from both.
--   * service_role: bypasses RLS automatically (admin reads).
--
-- We deliberately add no SELECT policy. Once RLS is on, missing
-- policy = denied. That locks reads down to service role only.

ALTER TABLE public.community_moderation_log ENABLE ROW LEVEL SECURITY;

-- INSERT policy: allow authenticated to log a moderation decision.
-- WITH CHECK is permissive because the row is wholly server-generated
-- (the user can't influence decision/confidence/model — those come
-- from the moderator function). content_type is constrained by the
-- table-level CHECK constraint.
DROP POLICY IF EXISTS "community_moderation_log_insert_authenticated"
  ON public.community_moderation_log;
CREATE POLICY "community_moderation_log_insert_authenticated"
  ON public.community_moderation_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMENT ON TABLE public.community_moderation_log IS
  'AI moderation audit trail. RLS enabled: authenticated role can INSERT (via the moderator running inside a user request) but cannot SELECT. All reads go through service role from admin pages.';
