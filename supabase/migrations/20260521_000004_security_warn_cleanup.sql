-- ============================================================
-- Close remaining WARN-level security lints (2026-05-21)
-- Source: Supabase Management API security advisor
-- ============================================================
-- Lints addressed:
--   1. anon_security_definer_function_executable  → handle_new_user
--   2. authenticated_security_definer_function_executable → handle_new_user
--   3. rls_enabled_no_policy (INFO x4):
--        flavia_phrase_candidates, professional_verification_audit,
--        public_content_proposals, scraped_public_sources
--
-- NOT addressed here (non-SQL):
--   4. auth_leaked_password_protection — toggle in Supabase dashboard
--   5. rls_policy_always_true on community_moderation_log — intentional
--      (row is wholly server-generated; table-level CHECK constraints
--       already enforce content_type enum validity)
-- ============================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1+2. handle_new_user: revoke direct execution from user-facing roles
-- ──────────────────────────────────────────────────────────────────────
-- handle_new_user is a SECURITY DEFINER trigger function called
-- exclusively by the on_auth_user_created trigger on auth.users.
-- The trigger fires under the postgres role — no end-user role needs
-- EXECUTE. The PUBLIC grant (which covers anon + authenticated) was
-- added by default at creation time and is now removed.
--
-- service_role and postgres keep their grants (required for migrations
-- and internal invocations). Trigger execution is unaffected.

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
-- Revoke the broad PUBLIC grant as well; explicit grants above remain.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- ──────────────────────────────────────────────────────────────────────
-- 3. Admin-only tables: explicit deny-all policy for non-service roles
-- ──────────────────────────────────────────────────────────────────────
-- These four tables have RLS enabled with no policies, which correctly
-- blocks authenticated/anon access (implicit deny). The lint flags the
-- absence of any policy as potentially unintentional.
--
-- Adding an explicit USING (false) policy:
--   a) Makes the intent self-documenting in the pg_policy catalog.
--   b) Clears the rls_enabled_no_policy advisor lint.
--   c) Has zero behaviour change — service_role bypasses RLS, and
--      authenticated/anon were already denied.
--
-- All four tables are written exclusively via the service_role client
-- (admin API routes and server-side workers). No authenticated-role
-- writes exist for any of them.

-- flavia_phrase_candidates: internal LLM phrase proposal store
DROP POLICY IF EXISTS "admin_only" ON public.flavia_phrase_candidates;
CREATE POLICY "admin_only"
  ON public.flavia_phrase_candidates
  FOR ALL
  USING (false);

COMMENT ON TABLE public.flavia_phrase_candidates IS
  'LLM-generated phrase candidates for Flavia voice tuning. '
  'Admin-only: readable/writable exclusively via service_role. '
  'RLS deny-all policy is intentional — no end-user access needed.';

-- professional_verification_audit: immutable admin audit trail
DROP POLICY IF EXISTS "admin_only" ON public.professional_verification_audit;
CREATE POLICY "admin_only"
  ON public.professional_verification_audit
  FOR ALL
  USING (false);

COMMENT ON TABLE public.professional_verification_audit IS
  'Audit trail for professional verification reviews. '
  'Admin-only: written by admin API, read by service_role only. '
  'RLS deny-all policy is intentional.';

-- public_content_proposals: extracted knowledge proposals pending review
DROP POLICY IF EXISTS "admin_only" ON public.public_content_proposals;
CREATE POLICY "admin_only"
  ON public.public_content_proposals
  FOR ALL
  USING (false);

COMMENT ON TABLE public.public_content_proposals IS
  'AI-extracted knowledge proposals from scraped public sources. '
  'Admin-only: managed via /admin/contenido-publico with service_role. '
  'RLS deny-all policy is intentional.';

-- scraped_public_sources: raw ingested content (YouTube, articles, etc.)
DROP POLICY IF EXISTS "admin_only" ON public.scraped_public_sources;
CREATE POLICY "admin_only"
  ON public.scraped_public_sources
  FOR ALL
  USING (false);

COMMENT ON TABLE public.scraped_public_sources IS
  'Raw public content ingested for Flavia knowledge base. '
  'Admin-only: written by /api/admin/public-content routes via service_role. '
  'RLS deny-all policy is intentional.';
