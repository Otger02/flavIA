-- Expand chat_sessions.active_topic CHECK constraint to include 6 new topics
-- New topics: jealousy, boundaries, pleasure, menopause, erectile_dysfunction, education

-- Drop existing constraint and re-create with all 13 topics
ALTER TABLE chat_sessions
  DROP CONSTRAINT IF EXISTS chat_sessions_active_topic_check;

ALTER TABLE chat_sessions
  ADD CONSTRAINT chat_sessions_active_topic_check
  CHECK (active_topic IS NULL OR active_topic IN (
    'desire',
    'couple_connection',
    'self_connection',
    'communication',
    'body_confidence',
    'routine',
    'curiosity',
    'jealousy',
    'boundaries',
    'pleasure',
    'menopause',
    'erectile_dysfunction',
    'education'
  ));

-- Expand recommendation_log.active_topic CHECK constraint
ALTER TABLE recommendation_log
  DROP CONSTRAINT IF EXISTS recommendation_log_active_topic_check;

ALTER TABLE recommendation_log
  ADD CONSTRAINT recommendation_log_active_topic_check
  CHECK (active_topic IS NULL OR active_topic IN (
    'desire',
    'couple_connection',
    'self_connection',
    'communication',
    'body_confidence',
    'routine',
    'curiosity',
    'jealousy',
    'boundaries',
    'pleasure',
    'menopause',
    'erectile_dysfunction',
    'education'
  ));
