-- Add is_official_reply flag to community_comments
-- Allows verified professionals to mark their replies as official responses

ALTER TABLE public.community_comments
  ADD COLUMN IF NOT EXISTS is_official_reply boolean NOT NULL DEFAULT false;

-- Allow users to update is_official_reply on their own published comments.
-- The application layer enforces that only verified professionals can set this to true.
CREATE POLICY "community_comments_update_own_official_reply"
  ON public.community_comments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'published')
  WITH CHECK (user_id = auth.uid());
