-- ───────────────────────────────────────────────────────────────────
-- Meta (Facebook + Instagram) OAuth integrations — Phase 1
-- ───────────────────────────────────────────────────────────────────
-- One row per connected Meta account. The current product surface
-- only allows ONE active connection at a time (Flavia's), but the
-- schema is designed so multiple admins / accounts could connect later.
--
-- Token storage:
--   The `access_token` column stores the long-lived (~60 day) Facebook
--   user access token used for Graph API calls.
--
--   TODO(security): wrap reads/writes in pgcrypto symmetric encryption
--   (pgp_sym_encrypt / pgp_sym_decrypt) once a key-management strategy
--   is in place. Plaintext is acceptable for the initial dev rollout —
--   the row is admin-only via service-role + RLS, and the column never
--   leaves the server. Tracked for follow-up.
--
-- Token lifecycle:
--   - status='active' on initial OAuth callback
--   - daily cron refreshes tokens expiring within 7 days
--   - status='expired' when refresh fails because the token is past
--     the 60-day refresh window
--   - status='revoked' when the user disconnects from /admin/integraciones
--   - status='error' when Meta returns an error during refresh

CREATE TABLE IF NOT EXISTS public.meta_integrations (
  id                              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  meta_user_id                    text NOT NULL,
  instagram_business_account_id   text,
  facebook_page_id                text,
  facebook_page_name              text,
  -- Long-lived FB user access token. See TODO(security) note above.
  access_token                    text NOT NULL,
  token_expires_at                timestamptz,
  granted_scopes                  text[] NOT NULL DEFAULT '{}',
  last_refreshed_at               timestamptz,
  status                          text NOT NULL DEFAULT 'active'
                                    CHECK (status IN ('active', 'revoked', 'expired', 'error')),
  error_details                   jsonb,
  created_at                      timestamptz NOT NULL DEFAULT now(),
  updated_at                      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meta_integrations_status_idx
  ON public.meta_integrations (status);

CREATE INDEX IF NOT EXISTS meta_integrations_expires_idx
  ON public.meta_integrations (token_expires_at)
  WHERE status = 'active';

-- Auto-update updated_at on every UPDATE.
CREATE OR REPLACE FUNCTION public.set_meta_integration_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS meta_integrations_set_updated_at ON public.meta_integrations;
CREATE TRIGGER meta_integrations_set_updated_at
  BEFORE UPDATE ON public.meta_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_meta_integration_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────────
ALTER TABLE public.meta_integrations ENABLE ROW LEVEL SECURITY;

-- Users can read their own integration row (lets the admin page show
-- "your connection" status without going through the service role).
DROP POLICY IF EXISTS "meta_integrations_select_own" ON public.meta_integrations;
CREATE POLICY "meta_integrations_select_own"
  ON public.meta_integrations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERTs and UPDATEs go through the service role (OAuth callback +
-- daily cron). No end-user write policies — closing them prevents an
-- end user from modifying their own token / status by hand.

COMMENT ON TABLE public.meta_integrations IS
  'OAuth integrations with Meta (Facebook / Instagram). One row per connected account. Tokens are managed by server-side flows; end users only read their own row to see status.';

COMMENT ON COLUMN public.meta_integrations.access_token IS
  'Long-lived Facebook user access token. Plaintext for now; planned migration to pgcrypto symmetric encryption once key management is decided.';
