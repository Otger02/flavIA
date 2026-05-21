-- ───────────────────────────────────────────────────────────────────
-- Onboarding fields on profiles
-- ───────────────────────────────────────────────────────────────────
-- Extends the existing `profiles` table to support the 3-screen
-- onboarding flow:
--   - onboarding_topics: text[] of optional self-declared interests
--     ("deseo", "pareja", "menopausia"...). Drives the suggested
--     prompts on screen 3 and feeds future personalization.
--   - onboarding_completed_at: timestamptz of when the user clicked
--     "Listo" or "Saltar". Coexists with the legacy boolean
--     `onboarding_completed` column — both stay in sync from the
--     server action.
--
-- Both columns default to NULL/empty so existing users are unaffected.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_topics text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

COMMENT ON COLUMN public.profiles.onboarding_topics IS
  'Self-declared interests captured during onboarding screen 2. Optional. Used to generate suggested prompts on screen 3.';

COMMENT ON COLUMN public.profiles.onboarding_completed_at IS
  'Timestamp when the user finished or skipped onboarding. NULL means they still need to go through the flow.';
