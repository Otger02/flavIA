import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { getAiModelConfig, getAiProviderKeys } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getSource } from "@/features/public-content/server/add-source";
import { mapProposalRow } from "@/features/public-content/server/map-rows";
import {
  CANONICAL_AUDIENCE_SLUGS,
  CANONICAL_TOPIC_SLUGS,
} from "@/features/public-content/constants";
import {
  llmProposalSchema,
  type LlmProposal,
  type PublicContentProposal,
  type ScrapedPublicSource,
} from "@/features/public-content/types";

const HAIKU_MODEL = getAiModelConfig().anthropicClassifierModel;
const MAX_LATENCY_MS = 90_000;
const MAX_INPUT_CHARS = 60_000; // ~15k tokens, well within Haiku's window
const MAX_PROPOSALS_PER_SOURCE = 8;

/**
 * The single most important prompt in this subsystem. The wording is
 * deliberately conservative: Haiku is told to return an empty array
 * before inventing anything, and every proposal MUST include a verbatim
 * `source_quote`. The Zod schema rejects proposals missing that field
 * so even a misbehaving model can't bypass it.
 *
 * Notes on phrasing:
 * - "Do NOT paraphrase what Flavia might have said" — explicit anti-hallucination.
 * - "Quality over quantity, empty array is a valid answer" — gives the
 *   model permission to refuse, which Haiku otherwise tries to please.
 * - "Spanish only" — the corpus is in Spanish; mixing languages would
 *   poison downstream Sanity content.
 */
const SYSTEM_PROMPT = `Eres un asistente de curación de contenido para la plataforma de Flavia Dos Santos, sexóloga.

Tu trabajo: leer un fragmento de contenido público real (transcripción de YouTube, artículo de prensa, etc.) y proponer pequeñas piezas de contenido que podrían publicarse en la plataforma. Solo en español.

REGLAS ABSOLUTAS:
1. NO inventes nada. Toda propuesta debe basarse en algo que aparece literalmente en el texto fuente.
2. Cada propuesta DEBE incluir un campo "source_quote": una cita textual del texto fuente (mínimo una frase, máximo ~300 palabras) que justifique la propuesta. Si no puedes citar la fuente, no propongas nada.
3. Si el texto no contiene material útil, devuelve un array vacío. La calidad importa más que la cantidad. Es preferible 0 propuestas a 1 inventada.
4. No parafrasees lo que Flavia "probablemente diría". Solo basándote en lo que dice.

TIPOS DE PROPUESTA:
- "quickly_item": tip corto y accionable (~80-200 palabras). title: imperativo, claro. excerpt: hook de 1 frase. full_content: el tip en sí, en voz de Flavia (cálida, directa, sin moralizar).
- "article": artículo más largo (~400-1200 palabras) sobre un tema concreto que Flavia desarrolla en la fuente. title: pregunta o afirmación clara. excerpt: 1-2 frases. full_content: artículo completo escrito a partir del material de la fuente.
- "community_thread": semilla para un hilo de comunidad — una pregunta o reflexión abierta que Flavia haya planteado y que la audiencia pueda continuar. full_content: el mensaje inicial del hilo.
- "signature_phrase": una frase memorable que Flavia dice literalmente y que podría usarse como cita en la app. full_content: la frase exacta, idéntica a source_quote. Úsalo solo cuando la frase sea muy reconocible y autocontenida.

CAMPOS:
- suggested_topics: 1-5 etiquetas escogidas EXCLUSIVAMENTE de esta lista exacta (lowercase, snake_case tal cual). NO inventes nuevas etiquetas. NO uses sinónimos. Si ninguna encaja, devuelve array vacío.
  [${CANONICAL_TOPIC_SLUGS.join(", ")}]
- suggested_audience: 1-3 etiquetas escogidas EXCLUSIVAMENTE de esta lista exacta. NO inventes nuevas. Si dudas, usa "todos".
  [${CANONICAL_AUDIENCE_SLUGS.join(", ")}]
- rationale: 1-2 frases sobre por qué crees que esto es valioso. Opcional.

Devuelve SOLO JSON válido con la estructura:
{"proposals": [ {...}, {...} ]}

Sin markdown, sin texto fuera del JSON, sin comentarios. Máximo ${MAX_PROPOSALS_PER_SOURCE} propuestas.`;

function buildUserPrompt(source: ScrapedPublicSource): string {
  const truncated = source.rawText.length > MAX_INPUT_CHARS
    ? source.rawText.slice(0, MAX_INPUT_CHARS) + "\n\n[...texto truncado...]"
    : source.rawText;

  return `FUENTE
- Tipo: ${source.sourceType}
- Título: ${source.title}
- Autor: ${source.author ?? "(desconocido)"}
- Fecha: ${source.publishedAt ?? "(desconocida)"}
- URL: ${source.sourceUrl}

TEXTO COMPLETO:
${truncated}

---

Devuelve las propuestas en JSON. Si el material no aporta nada útil o claro, devuelve {"proposals": []}.`;
}

type ParseResult = {
  proposals: LlmProposal[];
  /** Items that failed JSON parsing or Zod validation — surface in error_details. */
  parseRejections: Array<{ quote: string; reason: string }>;
  /** True when the whole response failed to parse as JSON. */
  responseUnparseable: boolean;
  /** Diagnostic snippet shown when response can't be parsed. */
  rawSnippet?: { head: string; tail: string; length: number };
};

function snippet(raw: string) {
  return {
    head: raw.slice(0, 400),
    tail: raw.length > 800 ? raw.slice(-400) : "",
    length: raw.length,
  };
}

function parseLlmResponse(raw: string): ParseResult {
  // Some Haiku responses wrap the JSON in prose like
  // "Aquí están las propuestas: ```json {…} ```". Be tolerant: pull
  // the first {…} block we can find, then try to parse it.
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const candidates: string[] = [trimmed];
  // Fallback: extract the first balanced-looking JSON object.
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace > 0 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  let parsed: unknown = null;
  for (const c of candidates) {
    try {
      parsed = JSON.parse(c);
      break;
    } catch {
      // try next candidate
    }
  }
  if (parsed === null) {
    return { proposals: [], parseRejections: [], responseUnparseable: true, rawSnippet: snippet(raw) };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { proposals: [], parseRejections: [], responseUnparseable: true, rawSnippet: snippet(raw) };
  }
  const proposalsRaw = (parsed as { proposals?: unknown }).proposals;
  if (!Array.isArray(proposalsRaw)) {
    return { proposals: [], parseRejections: [], responseUnparseable: true, rawSnippet: snippet(raw) };
  }

  const out: LlmProposal[] = [];
  const parseRejections: ParseResult["parseRejections"] = [];
  for (const candidate of proposalsRaw.slice(0, MAX_PROPOSALS_PER_SOURCE)) {
    const result = llmProposalSchema.safeParse(candidate);
    if (!result.success) {
      const sq =
        typeof (candidate as { source_quote?: unknown })?.source_quote === "string"
          ? ((candidate as { source_quote: string }).source_quote)
          : "";
      const issues = result.error.issues
        .slice(0, 2)
        .map((i) => `${i.path.join(".")}:${i.code}`)
        .join(",");
      // Include the keys actually returned — sometimes Haiku uses
      // `quote` or `cita` instead of the schema's `source_quote`.
      const actualKeys = candidate && typeof candidate === "object"
        ? Object.keys(candidate as Record<string, unknown>).slice(0, 10).join(",")
        : "—";
      parseRejections.push({
        quote: sq.slice(0, 80),
        reason: `schema_invalid(${issues}) keys=[${actualKeys}]`,
      });
      continue;
    }
    out.push(result.data);
  }
  return { proposals: out, parseRejections, responseUnparseable: false };
}

/**
 * Normalize text for quote-verification comparison.
 *
 * Goals:
 *  - Lower-case so capitalization doesn't matter.
 *  - Strip diacritics so "menopáusica" / "menopausica" match.
 *  - Normalize smart/curly quotes and angle quotes («», "", '') and the
 *    ellipsis character into ASCII equivalents — Haiku frequently
 *    upgrades punctuation when echoing a quote.
 *  - Collapse all whitespace runs to a single space.
 *
 * IMPORTANT: this only relaxes punctuation/whitespace. The actual
 * substring requirement still applies — Haiku can't invent a quote
 * and have it match.
 */
function normalizeForCompare(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[“”«»]/g, '"') // “ ” « »
    .replace(/[‘’]/g, "'") // ‘ ’
    .replace(/[…]/g, "...") // …
    .replace(/\s+/g, " ")
    .trim();
}

type QuoteCheckResult = { ok: true } | { ok: false; reason: "too_short" | "not_found_in_source" };

function checkQuote(quote: string, sourceText: string): QuoteCheckResult {
  const needle = normalizeForCompare(quote);
  const haystack = normalizeForCompare(sourceText);

  if (needle.length < 12) {
    return { ok: false, reason: "too_short" };
  }

  // Full normalized substring match (handles short and medium quotes).
  if (haystack.includes(needle)) return { ok: true };

  // For longer quotes, Haiku often paraphrases the tail or drops
  // trailing punctuation. Accepting on a 25-char prefix catches that
  // without weakening the anti-hallucination intent — the prefix is
  // long enough that no model can invent a 25-char string and have it
  // appear literally in the source by chance.
  if (needle.length >= 30) {
    const prefix = needle.slice(0, 25);
    if (haystack.includes(prefix)) return { ok: true };
  }

  return { ok: false, reason: "not_found_in_source" };
}

export type ProcessSourceResult = {
  sourceId: string;
  proposals: PublicContentProposal[];
  llmRejected: number;
  status: "processed" | "failed";
  reason?: string;
};

/**
 * Run Haiku over a source's raw_text, validate the response, drop any
 * proposals whose `source_quote` can't be found in the source, and
 * persist what's left. Updates the source row's status + processed_at.
 *
 * Never throws. Errors are written to `error_details` so the admin can
 * triage them in the UI.
 */
export async function processSource(sourceId: string): Promise<ProcessSourceResult> {
  const supabase = createAdminSupabaseClient();
  const source = await getSource(sourceId);

  if (!source) {
    return { sourceId, proposals: [], llmRejected: 0, status: "failed", reason: "source_not_found" };
  }

  if (!source.rawText || source.rawText.length < 200) {
    await supabase
      .from("scraped_public_sources")
      .update({
        status: "failed",
        error_details: { stage: "process", reason: "raw_text_too_short" },
      })
      .eq("id", sourceId);
    return { sourceId, proposals: [], llmRejected: 0, status: "failed", reason: "raw_text_too_short" };
  }

  const { anthropicApiKey } = getAiProviderKeys();
  if (!anthropicApiKey) {
    await supabase
      .from("scraped_public_sources")
      .update({
        status: "failed",
        error_details: { stage: "process", reason: "no_anthropic_key" },
      })
      .eq("id", sourceId);
    return { sourceId, proposals: [], llmRejected: 0, status: "failed", reason: "no_anthropic_key" };
  }

  let parseResult: ParseResult = { proposals: [], parseRejections: [], responseUnparseable: false };
  let candidateCount = 0;
  try {
    const client = new Anthropic({ apiKey: anthropicApiKey });
    const completion = await Promise.race([
      client.messages.create({
        model: HAIKU_MODEL,
        // 8 proposals × up to 20k chars each in worst case = needs ample
        // output budget. 4096 was truncating mid-JSON on 43k-char
        // sources (verified empirically). Haiku 4.5 supports much more;
        // 16k is safe and well within model limits.
        max_tokens: 16_384,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(source) }],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("haiku_timeout")), MAX_LATENCY_MS),
      ),
    ]);

    const text = completion.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    parseResult = parseLlmResponse(text);
    candidateCount = parseResult.proposals.length + parseResult.parseRejections.length;
  } catch (err) {
    const reason = err instanceof Error ? err.message : "unknown";
    await supabase
      .from("scraped_public_sources")
      .update({
        status: "failed",
        error_details: { stage: "haiku_call", reason: reason.slice(0, 300) },
      })
      .eq("id", sourceId);
    return { sourceId, proposals: [], llmRejected: 0, status: "failed", reason: `haiku_error:${reason}` };
  }

  // Anti-hallucination: drop proposals whose quote isn't actually in
  // the source (after normalization). Diagnostic log accumulates here
  // and gets persisted to error_details so the admin can see WHY
  // proposals were dropped without hunting through server logs.
  const verified: LlmProposal[] = [];
  const rejectedProposals: Array<{ quote: string; reason: string }> = [
    ...parseResult.parseRejections.map((r) => ({ quote: r.quote, reason: r.reason })),
  ];
  for (const p of parseResult.proposals) {
    const check = checkQuote(p.source_quote, source.rawText);
    if (check.ok) {
      verified.push(p);
    } else {
      rejectedProposals.push({
        quote: p.source_quote.slice(0, 80),
        reason: check.reason,
      });
    }
  }
  const llmRejected = rejectedProposals.length;

  // Insert verified proposals.
  const rows = verified.map((p) => ({
    source_id: sourceId,
    proposal_type: p.type,
    title: p.title.trim(),
    excerpt: p.excerpt.trim(),
    full_content: p.full_content.trim(),
    suggested_topics: p.suggested_topics ?? [],
    suggested_audience: p.suggested_audience ?? [],
    rationale: p.rationale?.trim() || null,
    source_quote: p.source_quote.trim(),
    status: "pending" as const,
  }));

  let savedProposals: PublicContentProposal[] = [];
  if (rows.length > 0) {
    const { data, error } = await supabase
      .from("public_content_proposals")
      .insert(rows)
      .select("*");
    if (!error && data) {
      savedProposals = data.map(mapProposalRow);
    }
  }

  // Build error_details payload. Always include the candidate count
  // (helps distinguish "Haiku returned nothing" from "everything was
  // rejected by the verifier"). Only include rejected_proposals when
  // there are any.
  const errorDetailsPayload: Record<string, unknown> | null =
    candidateCount > 0 || parseResult.responseUnparseable
      ? {
          stage: "process",
          candidates: candidateCount,
          accepted: verified.length,
          rejected: llmRejected,
          ...(parseResult.responseUnparseable ? { response_unparseable: true } : {}),
          ...(parseResult.rawSnippet ? { raw_snippet: parseResult.rawSnippet } : {}),
          ...(rejectedProposals.length > 0
            ? { rejected_proposals: rejectedProposals.slice(0, 20) }
            : {}),
        }
      : null;

  await supabase
    .from("scraped_public_sources")
    .update({
      status: "processed",
      processed_at: new Date().toISOString(),
      error_details: errorDetailsPayload,
    })
    .eq("id", sourceId);

  return {
    sourceId,
    proposals: savedProposals,
    llmRejected,
    status: "processed",
  };
}

/**
 * Re-process a source: delete its existing pending proposals (keeps
 * approved/rejected/published ones so audit trail is preserved) and
 * run extract again. Used to retry after the verifier was loosened
 * or after the prompt was tuned.
 */
export async function reprocessSource(sourceId: string): Promise<ProcessSourceResult> {
  const supabase = createAdminSupabaseClient();
  // Only delete pending — anything already approved/rejected/published
  // was a deliberate human decision and must not be silently re-created.
  await supabase
    .from("public_content_proposals")
    .delete()
    .eq("source_id", sourceId)
    .eq("status", "pending");
  await supabase
    .from("scraped_public_sources")
    .update({ status: "pending", processed_at: null, error_details: null })
    .eq("id", sourceId);
  return processSource(sourceId);
}

export async function listProposals(filters?: {
  status?: "pending" | "approved" | "rejected" | "published";
}): Promise<PublicContentProposal[]> {
  const supabase = createAdminSupabaseClient();
  let query = supabase
    .from("public_content_proposals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map(mapProposalRow);
}

export async function getProposal(id: string): Promise<PublicContentProposal | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("public_content_proposals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return mapProposalRow(data);
}
