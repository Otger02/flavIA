# Supabase Advisor Audit — Pre-Launch

**Generated:** 2026-05-19
**Source:** Supabase Management API (`/v1/projects/{ref}/advisors/{performance,security}`)
**Totals:** 112 lints (97 performance + 15 security)

| Severity | Count | Auto-fixed | Manual review |
|---|---|---|---|
| ERROR | 2 | 0 | 2 |
| WARN | 53 | 6 | 47 |
| INFO | 57 | 10 | 47 |
| **Total** | **112** | **16** | **96** |

Auto-fix migration: `supabase/migrations/20260519_000001_advisor_fixes.sql`

---

## ⛔ ERRORS (2)

### 1. `rls_disabled_in_public` — `public.community_moderation_log`

- **Severity:** ERROR · Security
- **Affected:** table `public.community_moderation_log`
- **Description:** Table is in the public schema but has no row-level security enabled.
- **Fix:** Manual review. Two questions: (a) do non-admin clients ever read this table via PostgREST, and (b) is it written by triggers under `auth.uid()` context? The cleanest fix is to enable RLS and add an admin-only SELECT policy plus a service-role-only INSERT (the moderation pipeline already runs under service-role).
- **Why not auto-fixed:** Enabling RLS without adding the right policies would silently break the moderation pipeline if anything in the API path reads this table as the user.

### 2. `security_definer_view` — `public.verified_professionals`

- **Severity:** ERROR · Security
- **Affected:** view `public.verified_professionals`
- **Description:** The view runs with the creator's privileges, bypassing RLS of the caller.
- **Fix:** Manual review. Most likely fix is `ALTER VIEW public.verified_professionals SET (security_invoker = true)`, but only after auditing what the view exposes — if it's listing approved professionals to anon, the public-facing column set must already be safe to expose without RLS.
- **Why not auto-fixed:** Changes the security model. Could either over-expose data or break the public profiles list depending on what columns the view selects.

---

## ⚠️ WARN (53)

### Functions with mutable `search_path` — **auto-fixed** (6)

| Function | Used in | Auto-fix |
|---|---|---|
| `public.handle_new_user()` | Auth signup trigger | `SET search_path = public, pg_catalog` |
| `public.update_thread_reply_count()` | Community trigger | `SET search_path = public, pg_catalog` |
| `public.auto_queue_on_reports()` | Community trigger | `SET search_path = public, pg_catalog` |
| `public.set_meta_integration_updated_at()` | Updated-at trigger | `SET search_path = public, pg_catalog` |
| `public.set_professional_verification_updated_at()` | Updated-at trigger | `SET search_path = public, pg_catalog` |
| `public.set_updated_at()` | Generic updated-at trigger | `SET search_path = public, pg_catalog` |

All six are unqualified-reference functions that only touch `public.*` and Postgres built-ins, so locking `search_path` to `public, pg_catalog` keeps behaviour identical while closing the search-path-hijack vector.

### RLS init plan (call `auth.uid()` per row instead of once) — **manual** (37)

The advisor flags **every** policy that does `auth.uid() = user_id` (etc.) instead of `(select auth.uid()) = user_id`. At scale the latter is evaluated once per statement; the former evaluates once per row. Fix is a mechanical rewrite of policy bodies.

Tables affected (policy count in parens):

`profiles` (3) · `subscriptions` (1) · `chat_sessions` (3) · `chat_messages` (2) · `user_state` (3) · `session_summaries` (2) · `recommendation_logs` (3) · `topic_feedback` (2) · `user_feedback` (2) · `user_favorites` (1) · `user_stories` (2) · `community_threads` (2) · `community_comments` (3) · `community_reports` (2) · `book_purchases` (1) · `affiliate_recommendation_events` (1) · `professional_verifications` (3) · `meta_integrations` (1)

Specific policies (full list): `profiles_select_own`, `profiles_insert_own`, `profiles_update_own`, `subscriptions_select_own`, `chat_sessions_select_own`, `chat_sessions_insert_own`, `chat_sessions_update_own`, `chat_messages_select_own`, `chat_messages_insert_own`, `user_state_select_own`, `user_state_insert_own`, `user_state_update_own`, `session_summaries_select_own`, `session_summaries_insert_own`, `recommendation_logs_select_own`, `recommendation_logs_insert_own`, `recommendation_logs_update_own`, `topic_feedback_select_own`, `topic_feedback_insert_own`, `Users can insert own feedback`, `Users can read own feedback`, `Users can manage own favorites`, `Users can insert own stories`, `Users can read own stories`, `threads_insert_own`, `threads_update_own`, `comments_insert_own`, `comments_update_own`, `reports_insert_own`, `reports_select_own`, `book_purchases_select_own`, `affiliate_rec_events_insert_own`, `professional_verifications_select_own`, `professional_verifications_insert_own`, `professional_verifications_update_own`, `community_comments_update_own_official_reply`, `meta_integrations_select_own`.

**Why not auto-fixed:** Each fix requires a `DROP POLICY ... CREATE POLICY ...` pair with rewritten bodies. That's RLS-policy logic; the user requested manual review for anything touching policies. A consolidated follow-up migration that does this for all 37 policies would be a sensible next step — they are mechanical and low-risk individually.

### Multiple permissive policies (same role + action) — **manual** (7)

| Table | Role | Action | Overlapping policies |
|---|---|---|---|
| `community_comments` | authenticated | UPDATE | `comments_update_own`, `community_comments_update_own_official_reply` |
| `professional_verifications` | authenticated | SELECT | `professional_verifications_select_own`, `professional_verifications_select_public_approved` |
| `user_stories` | anon | SELECT | `Anyone can read approved stories`, `Users can read own stories`, `user_stories_select_approved` |
| `user_stories` | authenticated | SELECT | same three as above |
| `user_stories` | authenticator | SELECT | same three |
| `user_stories` | dashboard_user | SELECT | same three |
| `user_stories` | supabase_privileged_role | SELECT | same three |

Each `SELECT` on these tables now runs every permissive policy in turn — measurable overhead. `user_stories` is the worst: three overlapping policies × five roles = 15 redundant checks.

**Recommended manual fix:** consolidate `user_stories` to a single SELECT policy `status = 'approved' OR user_id = (select auth.uid())`. For `community_comments`, merge `comments_update_own` with the official-reply policy into one. For `professional_verifications`, merge "own" and "public approved" into a single policy with an `OR`.

### Auth dashboard setting — **manual** (1)

- **`auth_leaked_password_protection`** — Enable HaveIBeenPwned check in Supabase Auth settings (Dashboard → Authentication → Policies → Leaked password protection). No SQL.

### SECURITY DEFINER functions callable via REST — **manual** (2)

- **`handle_new_user()`** executable by `anon` and by `authenticated`. The function is meant to fire only as a trigger on `auth.users`. Fix: `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;`. Manual because revoking a non-existent grant errors and the actual grant chain depends on how the function was created via the Supabase UI.

---

## ℹ️ INFO (57)

### Unindexed foreign keys — **auto-fixed** (10)

| Table | FK column | Action |
|---|---|---|
| `affiliate_recommendation_events` | `user_id` | `CREATE INDEX IF NOT EXISTS affiliate_recommendation_events_user_id_idx` |
| `community_reports` | `reviewed_by` | `CREATE INDEX IF NOT EXISTS community_reports_reviewed_by_idx` |
| `flavia_phrase_candidates` | `proposal_id` | `CREATE INDEX IF NOT EXISTS flavia_phrase_candidates_proposal_id_idx` |
| `professional_verification_audit` | `admin_user_id` | `CREATE INDEX IF NOT EXISTS professional_verification_audit_admin_user_id_idx` |
| `professional_verifications` | `reviewed_by` | `CREATE INDEX IF NOT EXISTS professional_verifications_reviewed_by_idx` |
| `public_content_proposals` | `reviewed_by` | `CREATE INDEX IF NOT EXISTS public_content_proposals_reviewed_by_idx` |
| `topic_feedback` | `session_id` | `CREATE INDEX IF NOT EXISTS topic_feedback_session_id_idx` |
| `user_feedback` | `user_id` | `CREATE INDEX IF NOT EXISTS user_feedback_user_id_idx` |
| `user_state` | `last_session_id` | `CREATE INDEX IF NOT EXISTS user_state_last_session_id_idx` |
| `user_stories` | `user_id` | `CREATE INDEX IF NOT EXISTS user_stories_user_id_idx` |

All 10 are unconditionally safe — adding a covering index speeds up FK lookups, cascades, and per-user queries; never changes behaviour.

### RLS enabled but no policies — **manual** (4)

Tables with RLS on but no policies — effectively locks the table to service-role only. This is intentional for some (the public-content scraping tables are admin-only), but should be confirmed explicitly:

- `flavia_phrase_candidates` — **intentional**, admin-only
- `professional_verification_audit` — **intentional**, admin-only audit log
- `public_content_proposals` — **intentional**, admin-only
- `scraped_public_sources` — **intentional**, admin-only

**Recommendation:** add a no-op explanatory policy or a `COMMENT ON TABLE ... IS 'service-role only — see admin migration'` so future audits know the lockdown is by design. Not migrated automatically.

### Unused indexes — **manual / pre-launch noise** (43)

The advisor reports an index as "unused" based on `pg_stat_user_indexes.idx_scan = 0`. **This project hasn't gone live yet**, so most of these are unused only because the queries haven't happened in production. Do not drop them blindly.

Indexes flagged: `profiles_plan_status_idx`, `profiles_created_at_idx`, `subscriptions_user_id_idx`, `subscriptions_status_idx`, `chat_sessions_started_at_idx`, `chat_sessions_active_topic_idx`, `chat_messages_created_at_idx`, `user_state_last_seen_at_idx`, `session_summaries_session_id_idx`, `session_summaries_user_id_idx`, `content_items_is_active_idx`, `content_items_priority_idx`, `content_items_published_at_idx`, `content_items_topic_tags_gin_idx`, `content_items_intent_tags_gin_idx`, `product_items_is_active_idx`, `product_items_priority_idx`, `product_items_topic_tags_gin_idx`, `product_items_intent_tags_gin_idx`, `recommendation_logs_session_id_idx`, `recommendation_logs_item_type_idx`, `recommendation_logs_clicked_idx`, `topic_feedback_user_id_idx`, `topic_feedback_source_idx`, `topic_feedback_status_idx`, `topic_feedback_created_at_idx`, `idx_community_threads_user`, `idx_comments_parent`, `idx_comments_user`, `idx_moderation_log_content`, `affiliate_recommendation_events_session_idx`, `affiliate_recommendation_events_product_idx`, `affiliate_recommendation_events_event_type_idx`, `book_purchases_user_id_idx`, `book_purchases_book_slug_idx`, `professional_verification_audit_verification_idx`, `public_content_proposals_type_idx`, `meta_integrations_status_idx`, `scraped_public_sources_status_idx`, `scraped_public_sources_type_idx`, `public_content_proposals_source_idx`, `public_content_proposals_status_idx`, `flavia_phrase_candidates_status_idx`.

**Recommendation:** re-run the advisor 4 weeks post-launch. Drop the survivors then. **Do not drop anything pre-launch.**

---

## Plan

1. ✅ **Now (auto-fixed in this PR):** apply `20260519_000001_advisor_fixes.sql` — adds 10 FK indexes + locks 6 function `search_path`s + ANALYZE. Total impact: better query plans on FK joins, neutralised search-path warnings. No behaviour change.

2. 📋 **This week (manual):**
   - Audit the `community_moderation_log` RLS-disabled error — decide policy or service-role-only access.
   - Audit `verified_professionals` view — flip to `security_invoker = true` if the column set is public-safe.
   - Toggle Auth → Leaked password protection in the Supabase dashboard.

3. 📋 **Before public launch (manual, larger):**
   - Sweep all 37 `auth_rls_initplan` policies into a single `DROP POLICY / CREATE POLICY` migration with `(select auth.uid())` form.
   - Consolidate the 7 multiple-permissive-policies overlaps (especially `user_stories` SELECT).
   - Revoke EXECUTE on `handle_new_user` from `anon` and `authenticated`.

4. 📋 **4 weeks post-launch:**
   - Re-run the advisor.
   - Drop indexes still showing zero scans in `pg_stat_user_indexes`.
