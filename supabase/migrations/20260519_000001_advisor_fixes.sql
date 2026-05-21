-- ============================================================
-- Advisor fixes — auto-fixable items only
-- Source: Supabase Management API
--   GET /v1/projects/{ref}/advisors/performance
--   GET /v1/projects/{ref}/advisors/security
-- Pulled: 2026-05-19
-- See scripts/supabase-advisor-report.md for the full audit
-- and the items deferred to manual review.
-- ============================================================
-- This migration only contains changes considered low-risk for
-- a running production workload:
--   1. CREATE INDEX IF NOT EXISTS on unindexed foreign keys
--      (covering-index addition; no behaviour change, only perf
--      improvement on FK joins and ON DELETE cascades).
--   2. ALTER FUNCTION ... SET search_path = ... on functions
--      flagged as "search_path mutable" (locks down resolution
--      to a fixed schema list; recommended security hardening
--      and does not change semantics for our functions, which
--      all reference unqualified objects in public/auth).
--
-- NOTHING in this file:
--   * Modifies any RLS policy
--   * Drops anything
--   * Changes column types
--   * Enables or disables RLS on existing tables
--   * Revokes any permission
-- All of the above were flagged but deferred to manual review.
-- ============================================================

-- ──────────────────────────────────────────────────────────────────────
-- 1. Indexes on foreign keys (10 fixes)
-- Advisor lint: unindexed_foreign_keys (INFO)
-- All FK columns are uuid; btree default is correct.
-- IF NOT EXISTS keeps this idempotent if any were added by hand.
-- ──────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS affiliate_recommendation_events_user_id_idx
  ON public.affiliate_recommendation_events (user_id);

CREATE INDEX IF NOT EXISTS community_reports_reviewed_by_idx
  ON public.community_reports (reviewed_by);

CREATE INDEX IF NOT EXISTS flavia_phrase_candidates_proposal_id_idx
  ON public.flavia_phrase_candidates (proposal_id);

CREATE INDEX IF NOT EXISTS professional_verification_audit_admin_user_id_idx
  ON public.professional_verification_audit (admin_user_id);

CREATE INDEX IF NOT EXISTS professional_verifications_reviewed_by_idx
  ON public.professional_verifications (reviewed_by);

CREATE INDEX IF NOT EXISTS public_content_proposals_reviewed_by_idx
  ON public.public_content_proposals (reviewed_by);

CREATE INDEX IF NOT EXISTS topic_feedback_session_id_idx
  ON public.topic_feedback (session_id);

CREATE INDEX IF NOT EXISTS user_feedback_user_id_idx
  ON public.user_feedback (user_id);

CREATE INDEX IF NOT EXISTS user_state_last_session_id_idx
  ON public.user_state (last_session_id);

CREATE INDEX IF NOT EXISTS user_stories_user_id_idx
  ON public.user_stories (user_id);

-- ──────────────────────────────────────────────────────────────────────
-- 2. Lock function search_path (6 fixes)
-- Advisor lint: function_search_path_mutable (WARN)
-- Setting search_path = public, pg_catalog keeps unqualified
-- references resolving exactly as they do today (all six
-- functions reference public.* tables and built-ins) while
-- closing the search_path-hijack vector that Postgres warns
-- about for SECURITY DEFINER functions.
-- ──────────────────────────────────────────────────────────────────────

ALTER FUNCTION public.handle_new_user()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.update_thread_reply_count()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.auto_queue_on_reports()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.set_meta_integration_updated_at()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.set_professional_verification_updated_at()
  SET search_path = public, pg_catalog;

ALTER FUNCTION public.set_updated_at()
  SET search_path = public, pg_catalog;

-- ──────────────────────────────────────────────────────────────────────
-- 3. Refresh planner statistics on newly-indexed tables
-- Helps the planner pick up the new indexes immediately.
-- ANALYZE is safe and non-blocking.
-- ──────────────────────────────────────────────────────────────────────

ANALYZE public.affiliate_recommendation_events;
ANALYZE public.community_reports;
ANALYZE public.flavia_phrase_candidates;
ANALYZE public.professional_verification_audit;
ANALYZE public.professional_verifications;
ANALYZE public.public_content_proposals;
ANALYZE public.topic_feedback;
ANALYZE public.user_feedback;
ANALYZE public.user_state;
ANALYZE public.user_stories;
