-- ============================================================
-- Audit fix F0-1: tighten RLS on community_comments so the
-- `is_official_reply` flag cannot be flipped by a non-verified
-- user through a direct PostgREST UPDATE.
-- ============================================================
-- Background:
--   Migration 20260503_000010_community_official_replies.sql added
--   the `is_official_reply boolean` column with a policy
--   `community_comments_update_own_official_reply` that allowed any
--   user to UPDATE their own published comments. The migration's
--   comment said "the application layer enforces that only verified
--   professionals can set this to true", but it did not — the API
--   route forwarded the client-supplied flag straight to the DB.
--   The application-layer fix is in place (route + createComment
--   now check professional_verifications.status='approved' server-
--   side), but a user could still bypass the route by writing
--   directly via PostgREST using their authenticated session token.
--
-- This migration adds the missing RLS enforcement:
--   * UPDATE is still allowed on own published comments,
--   * BUT setting is_official_reply to TRUE requires the acting
--     user to have an approved row in professional_verifications.
--   * Setting it to FALSE or leaving it unchanged is always allowed
--     (so users can still edit their own comments after losing
--     verification, just without the official badge).
-- ============================================================

DROP POLICY IF EXISTS "community_comments_update_own_official_reply"
  ON public.community_comments;

CREATE POLICY "community_comments_update_own_official_reply"
  ON public.community_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()) AND status = 'published')
  WITH CHECK (
    user_id = (select auth.uid())
    AND (
      -- The new row keeps is_official_reply false → always allowed.
      is_official_reply = false
      -- Or the user is currently an approved verified professional →
      -- allowed to write is_official_reply = true.
      OR EXISTS (
        SELECT 1 FROM public.professional_verifications pv
        WHERE pv.user_id = (select auth.uid())
          AND pv.status = 'approved'
      )
    )
  );

COMMENT ON POLICY "community_comments_update_own_official_reply"
  ON public.community_comments IS
  'Users can UPDATE their own published comments. is_official_reply may only be set to TRUE by users with an approved professional_verifications row. Setting it back to FALSE is always allowed. Audit fix F0-1.';
