# English Localization Plan

## Goal

Translate the full web experience and all written product/editorial content into English, excluding the chat experience for now.

This plan is designed for the current architecture in this repository:

- UI text is currently hardcoded mostly in React pages and components.
- The app is currently Spanish-first at the root layout and metadata level.
- Editorial library content already has a central model in Sanity.
- Community stories, threads and comments live in Supabase, not in Sanity.
- User profiles already contain `preferred_language`.

## Decision

Use persisted content by language for all product-owned and editorial content.

Do not use runtime AI translation for posts, library items or marketing pages.

For community/user-generated content, do not translate in phase 1. If translation is added later, use on-demand AI translation stored in the database and clearly marked as automatic.

## Why this approach

### Chosen model: localized content variants

Each product-owned content item should exist as a localized variant, for example one Spanish version and one English version, linked as the same conceptual asset.

This is better than runtime AI translation because it gives:

- Better SEO: indexable pages, stable URLs, `hreflang`, canonical control.
- Better editorial quality: tone and nuance can be reviewed.
- Better performance: no translation cost or latency on page render.
- Better trust: intimate/educational copy is not silently changing at runtime.
- Better product control: marketing, billing and legal copy can be reviewed before publication.

### Why not separate blogs/sites by language

Creating separate content silos for Spanish and English as unrelated posts would create duplicated operations, fragmented analytics and harder maintenance.

The right model is one content system with localized variants, not two parallel editorial systems.

### Where AI still makes sense

AI should be used as an editorial assistant:

- Generate a first English draft from Spanish.
- Let a human review the draft.
- Publish the reviewed English variant as normal CMS content.

That gives most of the speed benefit without the runtime quality risk.

## Scope

### In scope now

- Landing and marketing pages
- Auth pages
- Plans and billing UI copy
- Dashboard, account and admin UI copy
- Library listing and library item pages
- Metadata, Open Graph copy and email templates
- Date, number and label formatting by locale
- Language persistence and language switching

### Explicitly out of scope now

- Chat prompts, chat responses and chat generation behavior
- Real-time translation of chat conversations

### Deferred decision

- Community/user-generated translation

## Repository impact

### Current signals already in the repo

- Root layout is fixed to Spanish in `app/layout.tsx`.
- Metadata is Spanish-first in `app/layout.tsx` and several route pages.
- Dates are hardcoded to `es` or `es-ES` in multiple components and pages.
- Library content is centralized through Sanity queries in `lib/sanity/queries.ts`.
- Shared library schema fields are centralized in `sanity/schemaTypes/libraryFields.ts`.
- User preference already exists as `profiles.preferred_language` in `types/db.ts`.

### Main systems to adapt

1. Routing and locale resolution in Next.js App Router
2. UI copy extraction from components/pages
3. Sanity content modeling for localized editorial content
4. Metadata generation and SEO by locale
5. User language persistence
6. Formatting helpers for dates, labels and numbers
7. Emails and transactional copy

## Recommended technical architecture

## 1. App locale model

Support two locales:

- `es`
- `en`

Recommended behavior:

- Default locale: `es`
- Detect locale from URL first
- Fallback to user preference or cookie
- Fallback to browser locale only for first visit

Recommended route model:

- `/es/...`
- `/en/...`

If you want to keep Spanish without a prefix later, that can be added as a refinement, but the cleanest initial rollout is explicit locale prefixes for both.

## 2. i18n library

Recommended choice: `next-intl`

Why:

- Works well with App Router
- Supports server components cleanly
- Handles route-localized messages and formatting
- Keeps page metadata and server rendering manageable

## 3. Translation message layers

Split messages into these buckets:

- `marketing`
- `auth`
- `billing`
- `dashboard`
- `account`
- `library`
- `community`
- `admin`
- `navigation`
- `metadata`
- `emails`
- `shared`

This avoids one huge translation file and matches the repo structure.

## 4. Sanity content model

For all product-owned editorial types such as article, guide, faq, script, video and audio:

- Add `locale`
- Add `translationGroupId` or equivalent linking field
- Keep one document per language variant
- Keep localized `slug`, `title`, `excerpt`, `body`, SEO text and optional CTA copy

Recommended document model:

- Spanish document: locale `es`
- English document: locale `en`
- Both share the same `translationGroupId`

This allows:

- locale-specific URLs
- locale-specific publication status
- independent editorial review
- clean lookup by `slug + locale`

## 5. User-generated content model

For `user_stories`, `community_threads` and `community_comments`:

- Add `original_language`
- Keep original text as source of truth
- Do not translate in phase 1

If later needed:

- Add a cached translations table keyed by content id + target locale
- Translate on demand only once
- Mark translated output as automatic

## 6. Locale persistence

Use both:

- Cookie for anonymous visitors
- `profiles.preferred_language` for authenticated users

Write preference precedence like this:

1. URL locale
2. Saved user preference
3. Locale cookie
4. Browser language
5. Default `es`

## 7. SEO model

Every localized page should support:

- localized title and description
- canonical URL per locale
- `hreflang` alternate links
- localized Open Graph fields
- localized sitemap entries

This is a major reason to avoid runtime AI translation for product-owned content.

## Execution phases

## Phase 0. Foundation and inventory

Outcome: a complete map of what must be translated and where it lives.

Tasks:

- Inventory hardcoded UI strings in `app`, `components`, `features` and `lib/email`.
- Inventory date/number formatting fixed to Spanish.
- Inventory route metadata and Open Graph copy.
- Identify all Sanity content types that need locale support.
- Identify all database content that should remain untranslated in phase 1.

Deliverable:

- Translation inventory spreadsheet or markdown checklist.

## Phase 1. Locale infrastructure

Outcome: the app can render by locale even before all content is translated.

Tasks:

- Add locale-aware routing.
- Add `next-intl` configuration.
- Add message catalogs for `es` and `en`.
- Add locale switcher.
- Add helpers for locale-aware date/number formatting.
- Update root layout to derive `lang` and metadata from locale.

Success criteria:

- A route can render in both languages.
- `html lang` changes by locale.
- Dates and metadata are locale-aware.

## Phase 2. Product UI translation

Outcome: the application shell and all owned UI copy are bilingual.

Priority order:

1. Navigation and layout
2. Landing and marketing pages
3. Plans and billing flows
4. Auth pages
5. Dashboard and account
6. Library UI chrome
7. Community UI chrome
8. Admin UI
9. Email templates

Notes:

- Keep translation keys semantic, not tied to current Spanish text.
- Do not mix content translation with UI translation in the same pass.

## Phase 3. Sanity localization for editorial content

Outcome: library and editorial content is available as real English content, not dynamic translation.

Tasks:

- Extend shared schema fields in `sanity/schemaTypes/libraryFields.ts`.
- Add locale and translation linking fields to each editorial document type.
- Update Sanity Studio views so editors can manage translations.
- Update queries in `lib/sanity/queries.ts` to fetch by locale.
- Update page loaders to pass locale into content queries.
- Add fallback behavior only for unpublished English content in non-production preview flows.

Important:

- In production, if an English page does not exist yet, prefer a controlled fallback or redirect strategy rather than silently showing Spanish under an English URL.

## Phase 4. Content migration and editorial workflow

Outcome: the English site launches with curated, reviewed content.

Tasks:

- Define which current content gets translated first.
- Translate all marketing pages manually or with AI-assisted review.
- Translate the highest-value library content first.
- Create editorial QA criteria for tone, medical sensitivity and CTA clarity.
- Define content publication workflow: source draft, AI draft, human review, publish.

Recommended launch subset:

- Home page
- Plans page
- Login flow
- Core dashboard shell
- 10 to 15 top library pieces

## Phase 5. Community language handling

Outcome: user-generated content behaves predictably in a bilingual product.

Phase 1 recommendation:

- Show stories, threads and comments in original language only.
- Filter or label content by language if volume grows.

Later optional phase:

- Add “Translate to English” or “Translate to Spanish” on demand.
- Cache translated output.
- Show a disclaimer that translation is automatic.

## Concrete repo changes expected

### New areas likely needed

- `messages/es/*.json`
- `messages/en/*.json`
- locale-aware routing and request config files
- shared locale utilities in `lib`
- optional language switcher component

### Existing files that will need refactor

- `app/layout.tsx`
- marketing pages under `app/(marketing)`
- auth pages under `app/(auth)`
- account/dashboard/admin pages under `app/(app)`
- marketing and library components under `components`
- `lib/email/send-session-summary.ts`
- `lib/sanity/queries.ts`
- `sanity/schemaTypes/libraryFields.ts`
- library-related Sanity document types
- topic label/config files where display labels are Spanish-only

## Risks and controls

### Risk: translation effort balloons because UI text is embedded in components

Control:

- Extract infra first, then translate route-by-route.

### Risk: English pages accidentally render Spanish content

Control:

- Make locale explicit in data fetches.
- Avoid silent production fallback for editorial pages.

### Risk: taxonomy labels are translated inconsistently

Control:

- Keep internal enum values stable.
- Translate labels only at the presentation layer.

### Risk: community becomes mixed-language and confusing

Control:

- Store original language.
- Label language in UI if needed.
- Delay automatic translation until there is proven need.

### Risk: metadata and emails stay partially untranslated

Control:

- Include metadata and email copy in the same rollout checklist as UI pages.

## Recommended rollout order for this repo

1. Build locale infrastructure
2. Translate navigation, layouts and metadata
3. Translate landing and plans
4. Translate auth and account/dashboard shell
5. Localize library UI
6. Extend Sanity for localized editorial content
7. Publish reviewed English library content
8. Localize emails and admin surfaces
9. Revisit community translation only after launch

## Definition of done

The English rollout should be considered complete only when all of the following are true:

- The site can be navigated in English end-to-end outside the chat.
- Metadata and Open Graph are localized.
- All owned UI copy is translated.
- Editorial content shown in English URLs is real reviewed English content.
- Locale preference persists for logged-in and anonymous users.
- Dates, labels and numbers adapt by locale.
- No critical Spanish-only text remains in primary English flows.

## Final recommendation

Use a bilingual product architecture with localized persisted content.

- Product-owned content: translated and published per language
- User-generated content: original language first
- AI: used for drafting and later optional on-demand community translation, not as the default runtime renderer for the web