-- Community Feature Migration
-- Run manually in Supabase SQL Editor after review.
-- Depends on: profiles table existing with id uuid PK.

-- ============================================================
-- 1. community_threads (Conversaciones)
-- ============================================================

create table if not exists public.community_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(title) between 5 and 200),
  body text not null check (char_length(body) between 20 and 10000),
  topic text check (topic in (
    'desire', 'couple_connection', 'self_connection', 'communication',
    'body_confidence', 'routine', 'curiosity', 'jealousy', 'boundaries', 'pleasure'
  )),
  is_anonymous boolean not null default false,
  status text not null default 'published' check (status in ('published', 'hidden', 'removed')),
  is_pinned boolean not null default false,
  reply_count integer not null default 0,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_community_threads_status_activity
  on public.community_threads (status, last_activity_at desc);

create index if not exists idx_community_threads_topic
  on public.community_threads (topic)
  where status = 'published';

create index if not exists idx_community_threads_user
  on public.community_threads (user_id);

-- ============================================================
-- 2. community_comments (shared for threads + library + stories)
-- ============================================================

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'library_item', 'story')),
  target_id text not null,
  parent_comment_id uuid references public.community_comments(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 3000),
  is_anonymous boolean not null default false,
  status text not null default 'published' check (status in ('published', 'hidden', 'removed')),
  is_flavia_ai boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_comments_target
  on public.community_comments (target_type, target_id, status, created_at);

create index if not exists idx_comments_parent
  on public.community_comments (parent_comment_id)
  where parent_comment_id is not null;

create index if not exists idx_comments_user
  on public.community_comments (user_id);

-- ============================================================
-- 3. community_reports
-- ============================================================

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('thread', 'comment', 'story')),
  target_id uuid not null,
  reason text not null check (reason in (
    'spam', 'harassment', 'misinformation', 'off_topic', 'inappropriate', 'other'
  )),
  detail text check (char_length(detail) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  action_taken text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reports_status
  on public.community_reports (status, created_at desc);

create unique index if not exists idx_reports_unique_per_user
  on public.community_reports (reporter_id, target_type, target_id);

-- ============================================================
-- 4. community_moderation_log (AI decisions — server-only)
-- ============================================================

create table if not exists public.community_moderation_log (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in ('thread', 'comment', 'story')),
  content_id uuid not null,
  decision text not null check (decision in ('approved', 'flagged', 'rejected')),
  confidence float,
  reason text,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists idx_moderation_log_content
  on public.community_moderation_log (content_type, content_id);

-- ============================================================
-- 5. updated_at triggers (reuse existing set_updated_at function)
-- ============================================================

drop trigger if exists set_community_threads_updated_at on public.community_threads;
create trigger set_community_threads_updated_at
  before update on public.community_threads
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_community_comments_updated_at on public.community_comments;
create trigger set_community_comments_updated_at
  before update on public.community_comments
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- 6. Thread reply_count + last_activity_at trigger
-- ============================================================

create or replace function public.update_thread_reply_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' and new.target_type = 'thread' and new.status = 'published' then
    update public.community_threads
      set reply_count = reply_count + 1, last_activity_at = now()
      where id = new.target_id::uuid;
  elsif tg_op = 'UPDATE'
        and old.status = 'published'
        and new.status != 'published'
        and new.target_type = 'thread' then
    update public.community_threads
      set reply_count = greatest(reply_count - 1, 0)
      where id = new.target_id::uuid;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_update_thread_reply_count on public.community_comments;
create trigger trg_update_thread_reply_count
  after insert or update on public.community_comments
  for each row
  execute function public.update_thread_reply_count();

-- ============================================================
-- 7. Auto-queue content when it accumulates 3+ reports
-- ============================================================

create or replace function public.auto_queue_on_reports()
returns trigger
language plpgsql
as $$
declare
  report_count integer;
begin
  select count(*) into report_count
    from public.community_reports
    where target_type = new.target_type
      and target_id = new.target_id
      and status = 'pending';

  if report_count >= 3 then
    if new.target_type = 'thread' then
      update public.community_threads set status = 'hidden' where id = new.target_id;
    elsif new.target_type = 'comment' then
      update public.community_comments set status = 'hidden' where id = new.target_id;
    elsif new.target_type = 'story' then
      update public.user_stories set status = 'pending' where id = new.target_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_auto_queue_on_reports on public.community_reports;
create trigger trg_auto_queue_on_reports
  after insert on public.community_reports
  for each row
  execute function public.auto_queue_on_reports();

-- ============================================================
-- 8. Row Level Security
-- ============================================================

-- community_threads
alter table public.community_threads enable row level security;

drop policy if exists "threads_select_published" on public.community_threads;
create policy "threads_select_published"
  on public.community_threads
  for select
  using (status = 'published');

drop policy if exists "threads_insert_own" on public.community_threads;
create policy "threads_insert_own"
  on public.community_threads
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "threads_update_own" on public.community_threads;
create policy "threads_update_own"
  on public.community_threads
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- community_comments
alter table public.community_comments enable row level security;

drop policy if exists "comments_select_published" on public.community_comments;
create policy "comments_select_published"
  on public.community_comments
  for select
  using (status = 'published');

drop policy if exists "comments_insert_own" on public.community_comments;
create policy "comments_insert_own"
  on public.community_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "comments_update_own" on public.community_comments;
create policy "comments_update_own"
  on public.community_comments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- community_reports
alter table public.community_reports enable row level security;

drop policy if exists "reports_insert_own" on public.community_reports;
create policy "reports_insert_own"
  on public.community_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

drop policy if exists "reports_select_own" on public.community_reports;
create policy "reports_select_own"
  on public.community_reports
  for select
  to authenticated
  using (auth.uid() = reporter_id);

-- community_moderation_log: NO RLS (accessed only via service_role from server)
-- If you want to lock it down explicitly:
-- alter table public.community_moderation_log enable row level security;
-- (no policies = deny all via anon/authenticated, service_role bypasses RLS)
