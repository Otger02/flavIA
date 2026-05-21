-- ───────────────────────────────────────────────────────────────────
-- Public content scraping + proposal pipeline
-- ───────────────────────────────────────────────────────────────────
-- Ingests public Flavia content (YouTube transcripts, media
-- articles, hand-pasted transcripts), passes each source through
-- Haiku to generate content proposals, and stores those proposals
-- for human review before any Sanity write.
--
-- Decoupled from the Meta/Instagram OAuth flow — this works on
-- public content only. Manual-trigger only at this stage; the
-- cron wiring lives in vercel.json and is intentionally not added
-- here.

CREATE TABLE IF NOT EXISTS public.scraped_public_sources (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url        text NOT NULL,
  source_type       text NOT NULL CHECK (source_type IN (
                      'youtube',
                      'media_article',
                      'podcast_transcript',
                      'manual_text'
                    )),
  title             text NOT NULL,
  author            text,
  published_at      date,
  raw_text          text NOT NULL,
  language          text NOT NULL DEFAULT 'es',
  duration_minutes  integer,
  scraped_at        timestamptz NOT NULL DEFAULT now(),
  processed_at      timestamptz,
  status            text NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processed', 'failed')),
  error_details     jsonb,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scraped_public_sources_status_idx
  ON public.scraped_public_sources (status, scraped_at DESC);

CREATE INDEX IF NOT EXISTS scraped_public_sources_type_idx
  ON public.scraped_public_sources (source_type);

CREATE TABLE IF NOT EXISTS public.public_content_proposals (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id           uuid NOT NULL REFERENCES public.scraped_public_sources(id) ON DELETE CASCADE,
  proposal_type       text NOT NULL CHECK (proposal_type IN (
                        'quickly_item',
                        'article',
                        'community_thread',
                        'signature_phrase'
                      )),
  title               text NOT NULL,
  excerpt             text NOT NULL,
  full_content        text NOT NULL,
  suggested_topics    text[] NOT NULL DEFAULT '{}',
  suggested_audience  text[] NOT NULL DEFAULT '{}',
  rationale           text,
  source_quote        text NOT NULL,
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected', 'published')),
  reviewed_at         timestamptz,
  reviewed_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_notes        text,
  sanity_draft_id     text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS public_content_proposals_source_idx
  ON public.public_content_proposals (source_id, created_at DESC);

CREATE INDEX IF NOT EXISTS public_content_proposals_status_idx
  ON public.public_content_proposals (status, created_at DESC);

CREATE INDEX IF NOT EXISTS public_content_proposals_type_idx
  ON public.public_content_proposals (proposal_type);

-- Separate parking lot for signature-phrase proposals so we can
-- batch-update lib/ai/prompts/chat-system-prompt.ts during a single
-- prompt-engineering pass instead of one-off edits.
CREATE TABLE IF NOT EXISTS public.flavia_phrase_candidates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     uuid REFERENCES public.public_content_proposals(id) ON DELETE SET NULL,
  phrase          text NOT NULL,
  context         text,
  source_quote    text NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'added_to_prompt', 'rejected')),
  added_at        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS flavia_phrase_candidates_status_idx
  ON public.flavia_phrase_candidates (status, created_at DESC);

-- ── RLS — admin-only on all three tables ────────────────────────────
ALTER TABLE public.scraped_public_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_content_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flavia_phrase_candidates ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE policies — every operation goes through
-- the service-role client behind the admin guard. End users have
-- no business reading these tables.

COMMENT ON TABLE public.scraped_public_sources IS
  'Raw text content ingested from public sources (YouTube, media articles, hand-pasted). Processed by Haiku to generate public_content_proposals.';

COMMENT ON TABLE public.public_content_proposals IS
  'Content proposals derived from a public source by the Haiku processor. Each carries source_quote verbatim — invented content is not allowed.';

COMMENT ON TABLE public.flavia_phrase_candidates IS
  'Signature-phrase candidates waiting to be incorporated into chat-system-prompt.ts. Reviewed in batches during prompt-engineering passes.';
