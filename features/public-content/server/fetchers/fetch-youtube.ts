import "server-only";

/**
 * YouTube transcript fetcher.
 *
 * Uses the `youtube-transcript` npm package (dynamically imported so
 * tsc doesn't choke if it isn't installed yet — phase 2 of this
 * subsystem is the install step). Until the package is on disk this
 * fetcher throws a clear `package_not_installed` error that the
 * orchestrator surfaces in error_details, which the admin UI then
 * shows. The DB row stays with status='failed' — nothing else
 * breaks.
 *
 * Install when you're ready to use it:
 *   npm i youtube-transcript
 */

export type YoutubeFetchResult = {
  title: string;
  author: string | null;
  publishedAt: string | null;
  rawText: string;
  durationMinutes: number | null;
};

const YT_URL_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/i;

export function extractYoutubeVideoId(url: string): string | null {
  const match = url.match(YT_URL_RE);
  return match ? match[1] : null;
}

export async function fetchYoutubeTranscript(url: string): Promise<YoutubeFetchResult> {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    throw new Error("invalid_youtube_url");
  }

  let YoutubeTranscript: { fetchTranscript: (id: string) => Promise<Array<{ text: string; offset?: number; duration?: number }>> };
  try {
    // Dynamic import keeps the type-check passing when the package
    // isn't installed in the dev env yet.
    // Indirect specifier (string variable) prevents tsc from trying to
    // resolve the module type at compile time. The runtime import still
    // works once the package is installed.
    const moduleName = "youtube-transcript";
    YoutubeTranscript = (await import(/* webpackIgnore: true */ moduleName)) as unknown as typeof YoutubeTranscript;
  } catch {
    throw new Error("package_not_installed:youtube-transcript");
  }

  let segments: Array<{ text: string; duration?: number }>;
  try {
    segments = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    throw new Error(`transcript_unavailable:${reason.slice(0, 200)}`);
  }

  if (!segments || segments.length === 0) {
    throw new Error("transcript_empty");
  }

  const rawText = segments
    .map((segment) => segment.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  const totalMs = segments.reduce((acc, s) => acc + (typeof s.duration === "number" ? s.duration : 0), 0);
  const durationMinutes = totalMs > 0 ? Math.round(totalMs / 1000 / 60) : null;

  return {
    // youtube-transcript doesn't return video metadata; the caller
    // can override `title` from the admin form. Fall back to "YouTube
    // video <id>" so the row stays human-readable.
    title: `YouTube video ${videoId}`,
    author: null,
    publishedAt: null,
    rawText,
    durationMinutes,
  };
}
