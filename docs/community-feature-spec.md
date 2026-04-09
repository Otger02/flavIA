# FlavIA Community Feature — Technical Spec

**Status:** Draft — pending approval before implementation  
**Date:** 2026-04-09  
**Author:** Generated from codebase analysis

---

## 1. Current State: Historias

### What exists today

**Route:** `/stories` (inside `(app)` group — requires authentication)

**Files:**
| File | Role |
|---|---|
| `app/(app)/stories/page.tsx` | Server component, fetches 20 approved stories |
| `app/api/stories/route.ts` | POST (submit) + PATCH (moderate) |
| `components/stories/story-form.tsx` | Client form: textarea, anonymous toggle, 20-5000 chars |
| `app/(app)/admin/stories/page.tsx` | Admin page, groups by status (pending/approved/rejected) |
| `components/admin/admin-story-list.tsx` | Client list with optimistic approve/reject |

**Database:** `user_stories` table:
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto |
| `user_id` | uuid | FK to profiles |
| `content` | text | 20-5000 chars |
| `is_anonymous` | boolean | Default `true` |
| `status` | text | `pending` / `approved` / `rejected` |
| `created_at` | timestamptz | Auto |

**Behavior:**
- Every new story starts as `pending` — not visible until admin approves.
- Admin check is hardcoded: `ADMIN_EMAILS = ["otger02@gmail.com"]` (duplicated in 3 files).
- No pagination (hard limit of 20 on public page, unlimited on admin).
- No edit/delete for users or admins (approve/reject only).
- No rate limiting on submissions.
- The `StoryForm` receives `userId` as a prop but never uses it (API resolves user server-side).
- Non-anonymous stories show the static word "Usuaria" — no actual name display.
- **Stories page requires login.** Even reading stories requires auth (it's in the `(app)` group).

### What needs to change for Community

Historias becomes a **content type** within the Community section rather than a standalone page. Key migrations:

1. Move from `(app)/stories` to `(marketing)/comunidad` (allow public read access).
2. Add pagination (cursor-based or offset).
3. Add rate limiting (1/week for free, unlimited for Plus).
4. Reuse the existing `user_stories` table and `StoryForm` component — no need to recreate.
5. Extract `ADMIN_EMAILS` to a shared constant (currently hardcoded in 3 places).

---

## 2. Supabase Schema Additions

### 2.1 `community_threads` — Conversaciones

```sql
CREATE TABLE community_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 200),
  body text NOT NULL CHECK (char_length(body) BETWEEN 20 AND 10000),
  topic text, -- matches existing topic taxonomy (desire, communication, etc.)
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  is_pinned boolean NOT NULL DEFAULT false,
  reply_count integer NOT NULL DEFAULT 0,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_threads_status_activity
  ON community_threads (status, last_activity_at DESC);
CREATE INDEX idx_community_threads_topic
  ON community_threads (topic) WHERE status = 'published';
CREATE INDEX idx_community_threads_user
  ON community_threads (user_id);
```

**Slug generation:** Slugify from title + 6-char random suffix (e.g., `como-hablar-de-deseo-a3f9b2`). Generated server-side.

### 2.2 `community_comments` — Replies (shared for threads + library)

```sql
CREATE TYPE comment_target_type AS ENUM ('thread', 'library_item', 'story');

CREATE TABLE community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type comment_target_type NOT NULL,
  target_id text NOT NULL, -- uuid for threads/stories, slug for library items
  parent_comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 3000),
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'removed')),
  is_flavia_ai boolean NOT NULL DEFAULT false, -- true when "Invite Flavia" generates reply
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_comments_target
  ON community_comments (target_type, target_id, status, created_at);
CREATE INDEX idx_comments_parent
  ON community_comments (parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_comments_user
  ON community_comments (user_id);
```

**Why a single table for all comment types:**
- One API route, one moderation pipeline, one component.
- `target_type` + `target_id` is a polymorphic FK. Thread/story targets use uuid, library items use slug.
- `parent_comment_id` allows one level of nesting (replies-to-replies are flat — no deep threads).
- `is_flavia_ai` flags AI-generated replies for visual distinction.

### 2.3 `community_reports` — Content reports + moderation queue

```sql
CREATE TABLE community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('thread', 'comment', 'story')),
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN (
    'spam', 'harassment', 'misinformation', 'off_topic', 'inappropriate', 'other'
  )),
  detail text CHECK (char_length(detail) <= 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  action_taken text, -- 'none', 'hidden', 'removed', 'user_warned'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON community_reports (status, created_at DESC);
CREATE UNIQUE INDEX idx_reports_unique_per_user
  ON community_reports (reporter_id, target_type, target_id);
```

**The unique index** prevents a user from reporting the same content twice.

### 2.4 `community_moderation_log` — AI moderation decisions

```sql
CREATE TABLE community_moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('thread', 'comment', 'story')),
  content_id uuid NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approved', 'flagged', 'rejected')),
  confidence float,
  reason text,
  model text, -- 'gpt-4.1-mini' or 'claude-3-5-sonnet-latest'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_moderation_log_content
  ON community_moderation_log (content_type, content_id);
```

### 2.5 Additions to existing tables

```sql
-- reply_count trigger for threads
CREATE OR REPLACE FUNCTION update_thread_reply_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_type = 'thread' AND NEW.status = 'published' THEN
    UPDATE community_threads
      SET reply_count = reply_count + 1, last_activity_at = now()
      WHERE id = NEW.target_id::uuid;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status != 'published'
        AND NEW.target_type = 'thread' THEN
    UPDATE community_threads
      SET reply_count = GREATEST(reply_count - 1, 0)
      WHERE id = NEW.target_id::uuid;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_thread_reply_count
  AFTER INSERT OR UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_reply_count();

-- Auto-queue for review when report count hits 3
CREATE OR REPLACE FUNCTION auto_queue_on_reports()
RETURNS trigger AS $$
DECLARE
  report_count integer;
BEGIN
  SELECT count(*) INTO report_count
    FROM community_reports
    WHERE target_type = NEW.target_type AND target_id = NEW.target_id AND status = 'pending';

  IF report_count >= 3 THEN
    IF NEW.target_type = 'thread' THEN
      UPDATE community_threads SET status = 'hidden' WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'comment' THEN
      UPDATE community_comments SET status = 'hidden' WHERE id = NEW.target_id;
    ELSIF NEW.target_type = 'story' THEN
      UPDATE user_stories SET status = 'pending' WHERE id = NEW.target_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_queue_on_reports
  AFTER INSERT ON community_reports
  FOR EACH ROW
  EXECUTE FUNCTION auto_queue_on_reports();
```

### 2.6 RLS Policies

```sql
-- community_threads
ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published threads"
  ON community_threads FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert threads"
  ON community_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
  ON community_threads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- community_comments
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published comments"
  ON community_comments FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can insert comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON community_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- community_reports
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert reports"
  ON community_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own reports"
  ON community_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- community_moderation_log: no RLS (server-only via service role)
-- Admin operations use service role client (bypasses RLS)
```

---

## 3. Routing Structure

### New routes

| Route | Group | Auth | Description |
|---|---|---|---|
| `/comunidad` | `(marketing)` | Optional | Main feed: recent threads + recent historias |
| `/comunidad/[slug]` | `(marketing)` | Optional | Thread detail with replies |
| `/comunidad/nueva` | `(app)` | Required + Plus | Create new thread |
| `/admin/moderacion` | `(app)` | Required + Admin | Moderation dashboard |
| `/api/community/threads` | API | Varies | GET (list) / POST (create) |
| `/api/community/threads/[slug]` | API | Varies | GET (detail) |
| `/api/community/comments` | API | Required | GET (by target) / POST (create) |
| `/api/community/reports` | API | Required | POST (report content) |
| `/api/community/moderate` | API | Required + Admin | PATCH (approve/reject/hide) |
| `/api/community/invite-flavia` | API | Required + Plus | POST (generate AI reply in thread) |

### Impact on existing routes

| Existing route | Change |
|---|---|
| `/stories` | **Redirect** to `/comunidad?tab=historias` (301). Keep the old page for backward compat during transition. |
| `/library/[slug]` | **Add** `<CommentSection>` component below the body. No route change. |
| `/admin/stories` | **Merge into** `/admin/moderacion`. The new moderation dashboard handles all content types. |

### Navigation changes

Both `(app)/layout.tsx` and `(marketing)/layout.tsx` nav links:
- Replace "Historias" with "Comunidad" pointing to `/comunidad`.
- Admin link changes from `/admin/stories` to `/admin/moderacion`.

---

## 4. Paywall / Access Control

### Tier matrix

| Action | No account | Free | Plus |
|---|---|---|---|
| Read historias | First 3 (blurred rest) | All | All |
| Read threads | Title + first reply preview | All | All |
| Read library comments | All | All | All |
| Post historia | No | 1/week | Unlimited |
| Reply to thread | No | 3/day | Unlimited |
| Comment on library | No | 3/day (shared with reply limit) | Unlimited |
| Create thread | No | No | Yes |
| Invite Flavia to thread | No | No | Yes |
| Report content | No | Yes | Yes |
| Edit own content | No | Yes (30 min window) | Yes (30 min window) |
| Delete own content | No | Yes | Yes |

### Implementation — extend existing `canAccessFeature` pattern

**Step 1:** Add new feature keys to `features/billing/constants.ts`:

```typescript
export const BILLING_FEATURE_KEYS = {
  chatPriority: "chat-priority",
  extendedLibrary: "extended-library",
  premiumRecommendations: "premium-recommendations",
  // New community features
  communityCreateThread: "community-create-thread",
  communityUnlimitedPosts: "community-unlimited-posts",
  communityInviteFlavia: "community-invite-flavia",
} as const;
```

**Step 2:** Add to `requiredPlanByFeature` in `can-access-feature.ts`:

```typescript
[BILLING_FEATURE_KEYS.communityCreateThread]: BILLING_PLUS_PLAN,
[BILLING_FEATURE_KEYS.communityUnlimitedPosts]: BILLING_PLUS_PLAN,
[BILLING_FEATURE_KEYS.communityInviteFlavia]: BILLING_PLUS_PLAN,
```

**Step 3:** Create a new `enforceCommunityUsagePolicy` function (parallels `enforceUsagePolicy` for chat):

```
features/community/server/enforce-community-policy.ts
```

This function handles the rate-limited operations (1 story/week, 3 replies/day for free users). It queries existing counts from `user_stories` and `community_comments` for the current user within the relevant time window.

**Step 4:** Anonymous (no account) access is handled at the page level — the `/comunidad` page is in the `(marketing)` group, fetches `getUser()` optionally. If no user:
- Threads: show all titles but truncate body to 200 chars, show "Inicia sesion para leer mas".
- Historias: show first 3, blur the rest with a "Inicia sesion" overlay.
- No reply/post/report buttons visible.

### Design decision: Why not a middleware gate

The community pages live in `(marketing)` intentionally. The middleware only refreshes cookies — it does no routing. Adding middleware-level access checks would break the "read for free" model. Instead, access is checked per-action in the API routes, and the UI conditionally shows/hides interactive elements.

---

## 5. AI Moderation Layer

### Flow

```
User submits content
        │
        ▼
  API route receives POST
        │
        ▼
  enforceCommunityUsagePolicy() ── denied → 429 response
        │ allowed
        ▼
  moderateContent(text) ── calls existing AI client
        │
        ├── PASS (confidence > 0.85) → insert with status='published'
        │                                log to community_moderation_log
        │
        ├── UNCERTAIN (0.40–0.85) → insert with status='hidden'
        │                            log to community_moderation_log
        │                            show user: "Tu contenido esta siendo revisado"
        │
        └── FAIL (confidence < 0.40) → insert with status='hidden'
                                        log to community_moderation_log
                                        show user: "Tu contenido esta siendo revisado"
                                        (same UX — user doesn't know it was flagged)
```

### Implementation

**New file:** `features/community/server/moderate-content.ts`

```typescript
type ModerationResult = {
  decision: "approved" | "flagged" | "rejected";
  confidence: number;
  reason: string | null;
};
```

Uses the existing `generateChatResponse` pattern from `lib/ai/client.ts` (OpenAI primary → Anthropic fallback) but with a **moderation-specific prompt**:

```
You are a content moderator for an intimate wellness platform run by sexologist Flavia Dos Santos.

The platform accepts open, respectful conversations about sexuality, desire, intimacy, 
relationships, and body confidence. This is NOT a general-purpose forum — sexual topics 
are EXPECTED and WELCOME when discussed respectfully.

Content should be FLAGGED only if it contains:
- Direct threats or incitement to violence
- Non-consensual content or descriptions
- Content involving minors in any sexual context
- Spam, advertising, or phishing
- Doxxing or sharing private information
- Hate speech targeting identity groups

Content should be APPROVED if it:
- Discusses sexual topics respectfully (even if explicit)
- Shares personal experiences about intimacy
- Asks questions about desire, pleasure, or sexual health
- Expresses vulnerability about body image, relationships, etc.

Respond with JSON: { "decision": "approved"|"flagged"|"rejected", "confidence": 0.0-1.0, "reason": "..." }
```

**Critical calibration note:** This prompt must err on the side of permissiveness. An intimate wellness platform that flags its own topic domain will frustrate every user. The moderation targets harmful content, not sexual content.

### Invite Flavia (AI reply in thread)

**New file:** `features/community/server/generate-flavia-reply.ts`

- Uses `generateChatResponse` with a specialized prompt derived from `flavia-voice-profile.ts`.
- Prompt includes the thread title, body, and last 5 replies as context.
- The generated reply is inserted as a `community_comment` with `is_flavia_ai = true`.
- Subject to the same moderation check (even AI output gets validated).
- Rate limit: 1 Flavia invitation per thread (check if an `is_flavia_ai` comment already exists for that thread).

### User reports → auto-queue

Already handled by the `auto_queue_on_reports` trigger (see schema above). When 3 reports accumulate on any content, it's automatically hidden. The admin moderation dashboard surfaces hidden content for review.

---

## 6. Feature Flag System

### Environment variable

```
NEXT_PUBLIC_FEATURE_COMMUNITY=false
```

**Why `NEXT_PUBLIC_`:** The flag must be readable in client components (nav link visibility, UI elements) and server components. A server-only flag would require prop drilling from layouts.

### Implementation

**New file:** `lib/feature-flags.ts`

```typescript
export function isCommunityEnabled(): boolean {
  return process.env.NEXT_PUBLIC_FEATURE_COMMUNITY === "true";
}
```

### Where the flag is checked

| Location | Behavior when `false` |
|---|---|
| `(marketing)/layout.tsx` nav | "Comunidad" link hidden |
| `(app)/layout.tsx` nav | "Comunidad" link hidden |
| `mobile-nav.tsx` | "Comunidad" link hidden from links array |
| `/comunidad` page | Calls `notFound()` (returns 404) |
| `/comunidad/[slug]` page | Calls `notFound()` |
| `/comunidad/nueva` page | Calls `notFound()` |
| `/admin/moderacion` page | Calls `notFound()` |
| All `/api/community/*` routes | Returns `{ error: "Feature not available" }` with 404 |
| `/library/[slug]` comment section | `<CommentSection>` not rendered |
| `/stories` redirect | Does NOT redirect (old stories page stays alive) |

### How a non-developer toggles it

1. Vercel Dashboard → Project Settings → Environment Variables
2. Set `NEXT_PUBLIC_FEATURE_COMMUNITY` to `true`
3. Redeploy (Vercel triggers automatic redeploy on env var change if configured, otherwise click Redeploy)

For local dev: add to `.env.local`:
```
NEXT_PUBLIC_FEATURE_COMMUNITY=true
```

---

## 7. Risks and Conflicts

### 7.1 Admin system duplication

**Risk:** Admin email is hardcoded in 3 separate files (`api/stories/route.ts`, `admin/stories/page.tsx`, `(app)/layout.tsx`). Adding a 4th location (`/admin/moderacion`) compounds this.

**Mitigation:** Before building Community, extract `ADMIN_EMAILS` to a shared constant in `lib/constants.ts` and import it everywhere. One source of truth.

### 7.2 Stories route conflict

**Risk:** `/stories` currently lives in `(app)` (auth required). Moving historias to `/comunidad` (public) changes access semantics. Users who bookmarked `/stories` get a redirect.

**Mitigation:** Keep the 301 redirect from `/stories` → `/comunidad?tab=historias` indefinitely. The old `app/(app)/stories/page.tsx` becomes a one-line redirect file.

### 7.3 `user_stories` RLS policies

**Risk:** We don't know what RLS policies exist on `user_stories` — they were created in the Supabase Dashboard, not tracked in code. If the table has restrictive policies, public reads of historias on `/comunidad` will fail.

**Mitigation:** Before implementation, run in Supabase SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'user_stories';
```
Ensure there's a `SELECT` policy allowing reads on `status = 'approved'` rows without requiring auth, or add one.

### 7.4 Library items use slugs, not UUIDs

**Risk:** `community_comments.target_id` is `text` to support both UUIDs (threads, stories) and slugs (library items). This prevents a FK constraint to any single table.

**Mitigation:** This is intentional and acceptable. Referential integrity for comments is enforced at the application level (API validates that the target exists before inserting). The index on `(target_type, target_id)` ensures query performance.

### 7.5 AI moderation cost

**Risk:** Every post/reply triggers an AI moderation call. At scale, this adds up (gpt-4.1-mini is cheap but not free).

**Mitigation:**
- The moderation prompt is short (~200 tokens input + ~50 output). At gpt-4.1-mini pricing this is negligible for early-stage traffic.
- Rate limiting (free users: 3 replies/day, 1 story/week) provides a natural cost cap.
- If cost becomes material, consider switching to OpenAI's dedicated moderation endpoint (free) as a first pass, with the LLM as a second pass only for ambiguous cases.

### 7.6 Flavia AI reply quality

**Risk:** "Invite Flavia" generates AI content attributed to Flavia's brand. If the quality is poor or off-voice, it damages trust.

**Mitigation:**
- Use the already-configured `flavia-voice-profile.ts` for the reply prompt.
- Limit to 1 AI reply per thread (no back-and-forth in community).
- AI replies get a visual "Generado por IA" badge.
- Plus-only ensures a smaller, engaged audience initially.

### 7.7 `comment_target_type` enum migration

**Risk:** PostgreSQL enums are hard to alter (adding values requires `ALTER TYPE ... ADD VALUE`, which can't run inside a transaction in older Postgres versions).

**Mitigation:** Supabase runs Postgres 15+, which supports `ALTER TYPE ... ADD VALUE` inside transactions. If we need to add a target type later, it's a one-line migration. Alternatively, use a `text CHECK` constraint instead of an enum  — easier to extend. (The schema above uses a proper enum but this could be changed to a text check.)

### 7.8 No `profiles.display_name` populated

**Risk:** Non-anonymous posts would show the user's display name, but `profiles.display_name` may be NULL for most users (it exists in the schema but there's no UI to set it).

**Mitigation:** Fall back to "Usuaria" (matching current behavior) when `display_name` is null. Optionally, add a display name field to the account page. This is a separate enhancement, not a blocker.

---

## 8. Implementation Phases

### Phase 1 — Foundation (prerequisites)
1. Extract `ADMIN_EMAILS` to `lib/constants.ts`
2. Add `NEXT_PUBLIC_FEATURE_COMMUNITY` to `lib/env.ts` and feature flag utility
3. Run SQL migrations (tables, indexes, RLS, triggers)
4. Audit `user_stories` RLS policies in Supabase Dashboard
5. Add to `types/db.ts` (or regenerate from Supabase)

### Phase 2 — Conversaciones (threads)
1. API routes: `GET/POST /api/community/threads`, `GET /api/community/threads/[slug]`
2. `features/community/server/` — thread CRUD, slug generation
3. `features/community/server/moderate-content.ts` — AI moderation
4. `/comunidad` page — main feed (threads tab)
5. `/comunidad/[slug]` page — thread detail
6. `/comunidad/nueva` page — create thread (Plus only)
7. Nav link updates (behind feature flag)

### Phase 3 — Comments system
1. API route: `GET/POST /api/community/comments`
2. `<CommentSection>` component (reusable for threads + library)
3. Wire into `/comunidad/[slug]` (thread replies)
4. Wire into `/library/[slug]` (article comments)
5. Rate limiting enforcement

### Phase 4 — Historias migration
1. Migrate `/stories` into `/comunidad` with tab navigation
2. Reuse `StoryForm` with rate limiting added
3. 301 redirect from `/stories`
4. Public read access for approved stories (update RLS if needed)

### Phase 5 — Moderation + Reports
1. API routes: `POST /api/community/reports`, `PATCH /api/community/moderate`
2. `/admin/moderacion` page — unified dashboard (threads, comments, stories, reports)
3. Report button component
4. Migrate `/admin/stories` functionality into new dashboard

### Phase 6 — Invite Flavia
1. API route: `POST /api/community/invite-flavia`
2. `features/community/server/generate-flavia-reply.ts`
3. UI: button in thread detail (Plus only, once per thread)
4. Visual distinction for AI-generated comments

---

## 9. File Structure (proposed)

```
features/community/
  server/
    moderate-content.ts
    enforce-community-policy.ts
    generate-flavia-reply.ts
    get-threads.ts
    get-comments.ts
    create-thread.ts
    create-comment.ts
  types.ts
  constants.ts

components/community/
  thread-card.tsx
  thread-list.tsx
  thread-form.tsx
  comment-section.tsx
  comment-item.tsx
  comment-form.tsx
  report-button.tsx
  community-tabs.tsx
  invite-flavia-button.tsx

components/admin/
  moderation-dashboard.tsx    (replaces admin-story-list.tsx scope)
  moderation-item.tsx

app/(marketing)/comunidad/
  page.tsx                    (main feed)
  [slug]/page.tsx             (thread detail)
  loading.tsx

app/(app)/comunidad/
  nueva/page.tsx              (create thread — auth + Plus required)

app/(app)/admin/
  moderacion/page.tsx         (unified moderation)

app/api/community/
  threads/route.ts
  threads/[slug]/route.ts
  comments/route.ts
  reports/route.ts
  moderate/route.ts
  invite-flavia/route.ts

lib/
  feature-flags.ts
  constants.ts                (ADMIN_EMAILS extracted here)
```
