import "server-only";

/**
 * HTML article fetcher.
 *
 * Uses Mozilla Readability (via jsdom) to extract the main article
 * body from a media URL — the same algorithm Firefox Reader View uses.
 * Both packages are dynamically imported so tsc passes even if they
 * aren't installed yet. The orchestrator surfaces the
 * `package_not_installed` error in the admin UI.
 *
 * Install when ready:
 *   npm i jsdom @mozilla/readability
 *   npm i -D @types/jsdom
 */

export type HtmlArticleFetchResult = {
  title: string;
  author: string | null;
  publishedAt: string | null;
  rawText: string;
  durationMinutes: null;
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; FlaviaBot/1.0; +https://flavia.app)";

export async function fetchHtmlArticle(url: string): Promise<HtmlArticleFetchResult> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("invalid_url");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("invalid_url_protocol");
  }

  // Dynamic imports keep tsc happy when the packages aren't installed.
  let JSDOMCtor: new (html: string, opts?: { url?: string }) => {
    window: { document: Document };
  };
  let Readability: new (
    doc: Document,
  ) => {
    parse: () => null | {
      title?: string;
      byline?: string | null;
      textContent?: string;
      length?: number;
      publishedTime?: string | null;
    };
  };
  try {
    // Indirect specifiers (string variables) keep tsc from trying to
    // resolve the module types at compile time.
    const jsdomName = "jsdom";
    const readabilityName = "@mozilla/readability";
    const jsdomMod = (await import(/* webpackIgnore: true */ jsdomName)) as unknown as {
      JSDOM: typeof JSDOMCtor;
    };
    const readabilityMod = (await import(
      /* webpackIgnore: true */ readabilityName
    )) as unknown as { Readability: typeof Readability };
    JSDOMCtor = jsdomMod.JSDOM;
    Readability = readabilityMod.Readability;
  } catch {
    throw new Error("package_not_installed:jsdom_or_readability");
  }

  let html: string;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      // 20s should be plenty for a static article page.
      signal: AbortSignal.timeout(20_000),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`fetch_http_${response.status}`);
    }
    html = await response.text();
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    throw new Error(`fetch_failed:${reason.slice(0, 200)}`);
  }

  let parsedArticle: ReturnType<InstanceType<typeof Readability>["parse"]>;
  try {
    const dom = new JSDOMCtor(html, { url });
    const reader = new Readability(dom.window.document);
    parsedArticle = reader.parse();
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    throw new Error(`parse_failed:${reason.slice(0, 200)}`);
  }

  if (!parsedArticle || !parsedArticle.textContent) {
    throw new Error("article_empty");
  }

  const rawText = parsedArticle.textContent.replace(/\s+/g, " ").trim();
  if (rawText.length < 200) {
    throw new Error("article_too_short");
  }

  return {
    title: parsedArticle.title?.trim() || `Article from ${parsed.hostname}`,
    author: parsedArticle.byline?.trim() || null,
    publishedAt: parsedArticle.publishedTime || null,
    rawText,
    durationMinutes: null,
  };
}
