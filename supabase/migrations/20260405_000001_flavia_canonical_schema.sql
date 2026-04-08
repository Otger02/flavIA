create extension if not exists pgcrypto;

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  active_topic text check (active_topic in ('desire', 'couple_connection', 'self_connection', 'communication', 'body_confidence', 'routine', 'curiosity')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  href text not null,
  score double precision,
  topic_tags text[]
);

create table if not exists public.product_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  href text not null,
  score double precision,
  topic_tags text[]
);

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

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  status text not null default 'inactive' check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')),
  stripe_customer_id text,
  stripe_price_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists subscriptions_stripe_customer_id_key
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists chat_sessions_user_id_updated_at_idx
  on public.chat_sessions (user_id, updated_at desc);

create index if not exists chat_messages_session_id_created_at_idx
  on public.chat_messages (session_id, created_at desc);

create index if not exists chat_messages_user_id_session_id_role_idx
  on public.chat_messages (user_id, session_id, role);

create index if not exists content_items_score_idx
  on public.content_items (score desc nulls last);

create index if not exists product_items_score_idx
  on public.product_items (score desc nulls last);

create index if not exists content_items_topic_tags_gin_idx
  on public.content_items using gin (topic_tags);

create index if not exists product_items_topic_tags_gin_idx
  on public.product_items using gin (topic_tags);

create index if not exists recommendation_logs_user_id_created_at_idx
  on public.recommendation_logs (user_id, created_at desc);

create index if not exists recommendation_logs_session_id_created_at_idx
  on public.recommendation_logs (session_id, created_at desc);

create index if not exists recommendation_logs_item_type_item_id_idx
  on public.recommendation_logs (item_type, item_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_chat_sessions_updated_at on public.chat_sessions;
create trigger set_chat_sessions_updated_at
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.content_items enable row level security;
alter table public.product_items enable row level security;
alter table public.recommendation_logs enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own"
on public.chat_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own"
on public.chat_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own"
on public.chat_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
on public.chat_messages
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
on public.chat_messages
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "content_items_select_authenticated" on public.content_items;
create policy "content_items_select_authenticated"
on public.content_items
for select
to authenticated
using (true);

drop policy if exists "product_items_select_authenticated" on public.product_items;
create policy "product_items_select_authenticated"
on public.product_items
for select
to authenticated
using (true);

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

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

comment on table public.chat_sessions is 'Canonical chat sessions used by Flavia chat persistence.';
comment on table public.chat_messages is 'Canonical chat messages used by Flavia chat persistence.';
comment on table public.content_items is 'Simple content recommendations inventory queried from chat.';
comment on table public.product_items is 'Simple product recommendations inventory queried from chat.';
comment on table public.recommendation_logs is 'Impressions and clicks for recommendations shown in Flavia chat.';
comment on table public.subscriptions is 'Canonical billing state synchronized from Stripe webhooks.';

comment on column public.chat_sessions.status is 'Current chat session state. Code currently uses active or archived only.';
comment on column public.chat_sessions.active_topic is 'Closed-set inferred topic used for chat context and recommendations.';
comment on column public.content_items.topic_tags is 'Topic tags used for simple contains() recommendation filtering.';
comment on column public.product_items.topic_tags is 'Topic tags used for simple contains() recommendation filtering.';
comment on column public.subscriptions.user_id is 'Primary key by design because current code stores one active billing row per user.';