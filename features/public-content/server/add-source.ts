import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { mapSourceRow } from "@/features/public-content/server/map-rows";
import {
  fetchYoutubeTranscript,
  extractYoutubeVideoId,
} from "@/features/public-content/server/fetchers/fetch-youtube";
import { fetchHtmlArticle } from "@/features/public-content/server/fetchers/fetch-html-article";
import { prepareManualText } from "@/features/public-content/server/fetchers/save-manual-text";
import type {
  AddSourceInput,
  ScrapedPublicSource,
} from "@/features/public-content/types";

/**
 * Ingest a new public source. Dispatches to the right fetcher based on
 * source_type, persists the cleaned text (`raw_text`) along with
 * whatever metadata the fetcher could extract, and returns the saved
 * row. Status starts at 'pending' — `processSource` runs Haiku later.
 *
 * Errors from the fetcher are surfaced to the admin UI in
 * `error_details` so they can be diagnosed without checking logs.
 */
export async function addSource(input: AddSourceInput): Promise<ScrapedPublicSource> {
  const supabase = createAdminSupabaseClient();

  let title: string;
  let author: string | null;
  let publishedAt: string | null;
  let rawText: string;
  let durationMinutes: number | null;
  let sourceUrl: string;

  try {
    if (input.sourceType === "youtube") {
      if (!input.sourceUrl) throw new Error("missing_url");
      const videoId = extractYoutubeVideoId(input.sourceUrl);
      if (!videoId) throw new Error("invalid_youtube_url");
      const fetched = await fetchYoutubeTranscript(input.sourceUrl);
      title = input.titleOverride?.trim() || fetched.title;
      author = input.author?.trim() || fetched.author;
      publishedAt = input.publishedAt || fetched.publishedAt;
      rawText = fetched.rawText;
      durationMinutes = fetched.durationMinutes;
      sourceUrl = input.sourceUrl;
    } else if (input.sourceType === "media_article") {
      if (!input.sourceUrl) throw new Error("missing_url");
      const fetched = await fetchHtmlArticle(input.sourceUrl);
      title = input.titleOverride?.trim() || fetched.title;
      author = input.author?.trim() || fetched.author;
      publishedAt =
        input.publishedAt ||
        (fetched.publishedAt ? fetched.publishedAt.slice(0, 10) : null);
      rawText = fetched.rawText;
      durationMinutes = null;
      sourceUrl = input.sourceUrl;
    } else if (input.sourceType === "podcast_transcript") {
      // Treat podcast URLs identically to manual text — we expect the
      // admin to paste the transcript and provide the canonical URL.
      if (!input.sourceUrl) throw new Error("missing_url");
      if (!input.rawText) throw new Error("missing_raw_text");
      const prepared = prepareManualText({
        title: input.titleOverride?.trim() || "Podcast transcript",
        rawText: input.rawText,
        author: input.author,
        publishedAt: input.publishedAt,
      });
      title = prepared.title;
      author = prepared.author;
      publishedAt = input.publishedAt || null;
      rawText = prepared.rawText;
      durationMinutes = null;
      sourceUrl = input.sourceUrl;
    } else {
      // manual_text
      if (!input.rawText) throw new Error("missing_raw_text");
      const prepared = prepareManualText({
        title: input.titleOverride?.trim() || "Manual text",
        rawText: input.rawText,
        author: input.author,
        publishedAt: input.publishedAt,
      });
      title = prepared.title;
      author = prepared.author;
      publishedAt = input.publishedAt || null;
      rawText = prepared.rawText;
      durationMinutes = null;
      // Synthetic placeholder so the URL column stays non-null.
      sourceUrl = `manual:${crypto.randomUUID()}`;
    }
  } catch (err) {
    // Persist a failed row so the admin sees the error in the list and
    // can retry without losing the URL they typed in.
    const reason = err instanceof Error ? err.message : "unknown";
    const fallbackUrl =
      input.sourceUrl || `manual:${crypto.randomUUID()}`;
    const { data, error } = await supabase
      .from("scraped_public_sources")
      .insert({
        source_url: fallbackUrl,
        source_type: input.sourceType,
        title: input.titleOverride?.trim() || `Failed: ${fallbackUrl.slice(0, 80)}`,
        author: input.author?.trim() || null,
        published_at: input.publishedAt || null,
        raw_text: "",
        language: "es",
        duration_minutes: null,
        status: "failed",
        error_details: { stage: "fetch", reason },
      })
      .select("*")
      .single();
    if (error || !data) {
      throw new Error(`add_source_failed:${error?.message ?? "unknown"}`);
    }
    return mapSourceRow(data);
  }

  const { data, error } = await supabase
    .from("scraped_public_sources")
    .insert({
      source_url: sourceUrl,
      source_type: input.sourceType,
      title,
      author,
      published_at: publishedAt,
      raw_text: rawText,
      language: "es",
      duration_minutes: durationMinutes,
      status: "pending",
      error_details: null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`add_source_db_failed:${error?.message ?? "unknown"}`);
  }

  return mapSourceRow(data);
}

export async function listSources(): Promise<ScrapedPublicSource[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("scraped_public_sources")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error || !data) return [];
  return data.map(mapSourceRow);
}

export async function getSource(id: string): Promise<ScrapedPublicSource | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("scraped_public_sources")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapSourceRow(data);
}
