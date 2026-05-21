-- ============================================================
-- Add user_state_summary to chat_sessions (2026-05-21)
-- Stores a short LLM-generated summary of the user's emotional
-- state at the end of each session, used to personalise future
-- conversations and build longitudinal context over time.
-- ============================================================

ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS user_state_summary text;

COMMENT ON COLUMN public.chat_sessions.user_state_summary IS
  'Short LLM-generated summary of user emotional state at session end. '
  'Written by update-user-state.ts after every few assistant turns. '
  'Used as context in subsequent sessions.';
