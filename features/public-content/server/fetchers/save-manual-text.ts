import "server-only";

/**
 * Manual-paste "fetcher".
 *
 * Not really a fetcher — the admin already has the text (e.g. they
 * pasted in a transcript Flavia sent them by email, or copied an
 * article body by hand because the site blocks bots). We just
 * normalize whitespace and return it in the same shape as the real
 * fetchers so the orchestrator can treat all source types uniformly.
 */

export type ManualTextResult = {
  title: string;
  author: string | null;
  publishedAt: string | null;
  rawText: string;
  durationMinutes: null;
};

export type ManualTextInput = {
  title: string;
  rawText: string;
  author?: string | null;
  publishedAt?: string | null;
};

export function prepareManualText(input: ManualTextInput): ManualTextResult {
  const rawText = input.rawText.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (rawText.length < 80) {
    throw new Error("manual_text_too_short");
  }
  return {
    title: input.title.trim() || "Manual text",
    author: input.author?.trim() || null,
    publishedAt: input.publishedAt || null,
    rawText,
    durationMinutes: null,
  };
}
