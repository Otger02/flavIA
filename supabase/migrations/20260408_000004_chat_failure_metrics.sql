create table if not exists public.chat_failure_metrics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  error_code text not null,
  error_message text not null
);

create index if not exists chat_failure_metrics_session_created_idx
  on public.chat_failure_metrics (session_id, created_at desc);

create index if not exists chat_failure_metrics_user_created_idx
  on public.chat_failure_metrics (user_id, created_at desc);

alter table public.chat_failure_metrics enable row level security;

drop policy if exists "Users can view own chat failure metrics" on public.chat_failure_metrics;
create policy "Users can view own chat failure metrics"
  on public.chat_failure_metrics
  for select
  using (auth.uid() = user_id);

drop policy if exists "Service role can insert chat failure metrics" on public.chat_failure_metrics;
create policy "Service role can insert chat failure metrics"
  on public.chat_failure_metrics
  for insert
  with check (auth.role() = 'service_role');