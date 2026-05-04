-- Tracks the lifecycle of contextual affiliate-product recommendations
-- shown in the chat. One row per event ('shown' / 'clicked' / 'dismissed').
--
-- Decoupled from the existing `recommendation_log` table, which tracks
-- the library-content recommendation engine. Affiliate is a separate
-- revenue stream with its own analytics needs (commission attribution,
-- per-brand CTR, dismissal rate).

CREATE TABLE IF NOT EXISTS public.affiliate_recommendation_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id    uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  product_slug  text NOT NULL,
  event_type    text NOT NULL CHECK (event_type IN ('shown', 'clicked', 'dismissed')),
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS affiliate_recommendation_events_session_idx
  ON public.affiliate_recommendation_events (session_id);

CREATE INDEX IF NOT EXISTS affiliate_recommendation_events_product_idx
  ON public.affiliate_recommendation_events (product_slug);

CREATE INDEX IF NOT EXISTS affiliate_recommendation_events_session_dismissed_idx
  ON public.affiliate_recommendation_events (session_id, product_slug)
  WHERE event_type = 'dismissed';

CREATE INDEX IF NOT EXISTS affiliate_recommendation_events_event_type_idx
  ON public.affiliate_recommendation_events (event_type, created_at DESC);

-- ── RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.affiliate_recommendation_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users can write events for themselves only. Anonymous
-- users (user_id IS NULL) write 'shown' events through the server
-- (admin client bypasses RLS), so no anon INSERT policy is needed.
DROP POLICY IF EXISTS "affiliate_rec_events_insert_own"
  ON public.affiliate_recommendation_events;
CREATE POLICY "affiliate_rec_events_insert_own"
  ON public.affiliate_recommendation_events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- SELECT is admin-only. The session-scoped dismissal lookup runs via
-- the server (admin client), so end users never need to read this table
-- directly.
-- (No SELECT policy = no reads via the user-scoped client.)

COMMENT ON TABLE public.affiliate_recommendation_events IS
  'Lifecycle events for affiliate-product recommendations shown in the chat. Insert-only for authenticated users on their own user_id; reads are admin-only.';

COMMENT ON COLUMN public.affiliate_recommendation_events.metadata IS
  'Free-form jsonb. For "shown" events typically includes {contextTags: [...], keywords: [...], confidence: ...}. For "clicked" / "dismissed" can be empty.';
