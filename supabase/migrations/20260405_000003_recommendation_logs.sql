create table if not exists public.recommendation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  item_type text not null check (item_type in ('content', 'product')),
  item_id uuid not null,
  active_topic text check (active_topic in ('desire', 'couple_connection', 'self_connection', 'communication', 'body_confidence', 'routine', 'curiosity')),
  created_at timestamptz not null default timezone('utc', now()),
  clicked_at timestamptz
);

create index if not exists recommendation_logs_user_id_created_at_idx
  on public.recommendation_logs (user_id, created_at desc);

create index if not exists recommendation_logs_session_id_created_at_idx
  on public.recommendation_logs (session_id, created_at desc);

create index if not exists recommendation_logs_item_type_item_id_idx
  on public.recommendation_logs (item_type, item_id);

alter table public.recommendation_logs enable row level security;

drop policy if exists "recommendation_logs_select_own" on public.recommendation_logs;
create policy "recommendation_logs_select_own"
on public.recommendation_logs
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "recommendation_logs_insert_own" on public.recommendation_logs;
create policy "recommendation_logs_insert_own"
on public.recommendation_logs
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "recommendation_logs_update_own" on public.recommendation_logs;
create policy "recommendation_logs_update_own"
on public.recommendation_logs
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

comment on table public.recommendation_logs is 'Impressions and clicks for recommendations shown in Flavia chat.';