alter table public.chat_sessions
add column if not exists active_topic text;

alter table public.chat_sessions
drop constraint if exists chat_sessions_active_topic_check;

alter table public.chat_sessions
add constraint chat_sessions_active_topic_check
check (active_topic in ('desire', 'couple_connection', 'self_connection', 'communication', 'body_confidence', 'routine', 'curiosity'));

comment on column public.chat_sessions.active_topic is 'Closed-set inferred topic used for chat context and recommendations.';