-- One row per successful one-time book purchase.
-- Decoupled from `subscriptions` because books are a separate revenue
-- stream (mode='payment' in Stripe, not 'subscription').

CREATE TABLE IF NOT EXISTS public.book_purchases (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_slug                   text NOT NULL,
  stripe_session_id           text NOT NULL,
  stripe_payment_intent_id    text,
  amount_cop                  integer NOT NULL CHECK (amount_cop >= 0),
  purchased_at                timestamptz NOT NULL DEFAULT now(),
  refunded_at                 timestamptz,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  -- Idempotency: a single Stripe session must not produce two purchase rows.
  UNIQUE (stripe_session_id)
);

CREATE INDEX IF NOT EXISTS book_purchases_user_id_idx
  ON public.book_purchases (user_id);

CREATE INDEX IF NOT EXISTS book_purchases_book_slug_idx
  ON public.book_purchases (book_slug);

-- ── RLS ────────────────────────────────────────────────────────────────
ALTER TABLE public.book_purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchase rows (used by the download endpoint
-- and the "you already bought this" UI).
DROP POLICY IF EXISTS "book_purchases_select_own" ON public.book_purchases;
CREATE POLICY "book_purchases_select_own"
  ON public.book_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- No INSERT/UPDATE/DELETE policy for end users — those operations only
-- happen server-side via the admin client (the Stripe webhook), which
-- bypasses RLS.

COMMENT ON TABLE public.book_purchases IS
  'One-time book purchases. Created by the Stripe webhook handler on checkout.session.completed (mode=payment). RLS limits SELECT to the buyer.';

COMMENT ON COLUMN public.book_purchases.refunded_at IS
  'NULL until a refund webhook fires. Download endpoint must check this is NULL before serving the file.';
