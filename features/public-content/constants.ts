/**
 * Mapping tables: Haiku-emitted suggested_topics / suggested_audience
 * → the canonical Sanity enum values expected by quicklyItem / article.
 *
 * Two layers of defence (both should be active):
 *   1. The prompt in `extract-proposals.ts` now passes the canonical
 *      lists to Haiku, so new proposals should already use the right
 *      slugs.
 *   2. This map normalises legacy proposals + any model drift on
 *      approve. Unknown tags are dropped (not inserted as invalid
 *      enum values that Sanity would reject).
 *
 * Maintenance: when the canonical TopicSlug / LibraryAudience list
 * grows, add the Spanish/hyphenated variants here so historical
 * proposals stay mappable.
 */

import { ALL_TOPICS, type TopicSlug } from "@/lib/topic-config";
import { LIBRARY_AUDIENCES, type LibraryAudience } from "@/features/library/constants";

// ──────────────────────────────────────────────────────────────────────
// Topic mapping
// ──────────────────────────────────────────────────────────────────────

/**
 * All keys are lower-cased and trimmed before lookup so the table only
 * needs the canonical form. Hyphenated and underscored variants are
 * normalised before matching (see normaliseTagKey below).
 */
const TOPIC_TAG_MAP_RAW: Record<string, TopicSlug> = {
  // Identity passthroughs (Haiku sometimes emits the canonical slug)
  desire: "desire",
  couple_connection: "couple_connection",
  self_connection: "self_connection",
  communication: "communication",
  body_confidence: "body_confidence",
  routine: "routine",
  curiosity: "curiosity",
  jealousy: "jealousy",
  boundaries: "boundaries",
  pleasure: "pleasure",
  menopause: "menopause",
  erectile_dysfunction: "erectile_dysfunction",
  education: "education",
  identity: "identity",

  // ── Spanish base words ─────────────────────────────────────────────
  deseo: "desire",
  deseo_sexual: "desire",
  libido: "desire",
  excitacion: "desire",
  estimulacion: "desire",
  estimulacion_mental: "desire",
  expectativas: "desire",
  expectativas_sexuales: "desire",
  memoria_sensorial: "desire",

  pareja: "couple_connection",
  parejas: "couple_connection",
  conexion: "couple_connection",
  conexion_en_pareja: "couple_connection",
  intimidad: "couple_connection",
  vinculo: "couple_connection",

  autoconocimiento: "self_connection",
  auto_conocimiento: "self_connection",
  conexion_con_uno_mismo: "self_connection",
  autoaceptacion: "self_connection",
  autoestima: "self_connection",

  comunicacion: "communication",
  dialogo: "communication",
  escucha: "communication",
  escucha_activa: "communication",
  conversacion: "communication",

  cuerpo: "body_confidence",
  cuerpo_femenino: "body_confidence",
  imagen_corporal: "body_confidence",
  confianza_corporal: "body_confidence",
  pelviano: "body_confidence",
  fortaleza_pelvica: "body_confidence",
  suelo_pelvico: "body_confidence",
  kegel: "body_confidence",
  ejercicios_kegel: "body_confidence",

  rutina: "routine",
  novedad: "routine",
  variedad: "routine",

  curiosidad: "curiosity",
  exploracion: "curiosity",
  juguetes: "curiosity",

  celos: "jealousy",

  limites: "boundaries",
  consentimiento: "boundaries",

  placer: "pleasure",
  orgasmo: "pleasure",
  orgasmos: "pleasure",
  goce: "pleasure",

  menopausia: "menopause",
  climaterio: "menopause",
  perimenopausia: "menopause",
  resequedad_vaginal: "menopause",
  sequedad_vaginal: "menopause",
  sequedad: "menopause",
  segunda_edad: "menopause", // "second age" — older-age sexuality, fits menopause bucket
  edad_madura: "menopause",
  cambios_hormonales: "menopause",

  disfuncion_erectil: "erectile_dysfunction",
  ereccion: "erectile_dysfunction",
  perdida_de_ereccion: "erectile_dysfunction",
  impotencia: "erectile_dysfunction",

  educacion: "education",
  educacion_sexual: "education",
  educacion_medica: "education",
  sexualidad_en_consulta: "education",
  informacion: "education",
  divulgacion: "education",

  identidad: "identity",
  orientacion: "identity",
  diversidad: "identity",
  lgtb: "identity",
  lgtbi: "identity",
  lgbt: "identity",
  lgbtq: "identity",

  // ── Common drop-by-aliasing: Haiku-y vague labels → closest topic ──
  // Anything not listed here will be dropped silently on approve.
};

const VALID_TOPIC_SET = new Set<string>(ALL_TOPICS);
const TOPIC_TAG_MAP: ReadonlyMap<string, TopicSlug> = new Map(
  Object.entries(TOPIC_TAG_MAP_RAW),
);

// ──────────────────────────────────────────────────────────────────────
// Audience mapping
// ──────────────────────────────────────────────────────────────────────

const AUDIENCE_TAG_MAP_RAW: Record<string, LibraryAudience> = {
  // Identity passthroughs
  hombres: "hombres",
  mujeres: "mujeres",
  parejas: "parejas",
  adolescentes: "adolescentes",
  edad_madura: "edad_madura",
  todos: "todos",

  // ── Common Haiku variants ──────────────────────────────────────────
  hombre: "hombres",
  mujer: "mujeres",
  pareja: "parejas",
  parejas_de_larga_duracion: "parejas",
  parejas_estables: "parejas",
  parejas_jovenes: "parejas",

  jovenes: "adolescentes",
  adolescente: "adolescentes",
  adolescencia: "adolescentes",

  mayores: "edad_madura",
  adultos_mayores: "edad_madura",
  maduros: "edad_madura",
  menopausia: "edad_madura",
  mujeres_40_plus: "edad_madura",
  mujeres_50_plus: "edad_madura",
  mujeres_maduras: "edad_madura",
  mujeres_en_menopausia: "edad_madura",
  edad_avanzada: "edad_madura",

  general: "todos",
  publico_general: "todos",
  cualquiera: "todos",
  todo_publico: "todos",
};

const VALID_AUDIENCE_SET = new Set<string>(LIBRARY_AUDIENCES);
const AUDIENCE_TAG_MAP: ReadonlyMap<string, LibraryAudience> = new Map(
  Object.entries(AUDIENCE_TAG_MAP_RAW),
);

// ──────────────────────────────────────────────────────────────────────
// Lookup helpers
// ──────────────────────────────────────────────────────────────────────

/**
 * Normalise a tag string into the map's key form: lowercase, strip
 * diacritics, replace hyphens / spaces / dots with underscore.
 * "Resequedad-Vaginal" → "resequedad_vaginal".
 */
function normaliseTagKey(tag: string): string {
  return tag
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s.\-]+/g, "_");
}

/**
 * Map an array of Haiku-emitted topic strings to canonical TopicSlugs.
 * Drops unknowns. Deduplicates. Never throws.
 */
export function mapTopicTags(rawTags: readonly string[]): TopicSlug[] {
  const out = new Set<TopicSlug>();
  for (const raw of rawTags) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const key = normaliseTagKey(raw);
    // 1. direct hit on the map
    const mapped = TOPIC_TAG_MAP.get(key);
    if (mapped) {
      out.add(mapped);
      continue;
    }
    // 2. raw key already a canonical slug
    if (VALID_TOPIC_SET.has(key)) {
      out.add(key as TopicSlug);
      continue;
    }
    // 3. drop (no enum-valid value → would be rejected by Sanity anyway)
  }
  return Array.from(out);
}

/**
 * Map an array of Haiku-emitted audience strings to canonical
 * LibraryAudience values. Drops unknowns.
 */
export function mapAudienceTags(rawTags: readonly string[]): LibraryAudience[] {
  const out = new Set<LibraryAudience>();
  for (const raw of rawTags) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    const key = normaliseTagKey(raw);
    const mapped = AUDIENCE_TAG_MAP.get(key);
    if (mapped) {
      out.add(mapped);
      continue;
    }
    if (VALID_AUDIENCE_SET.has(key)) {
      out.add(key as LibraryAudience);
      continue;
    }
  }
  return Array.from(out);
}

/** Canonical enum lists, re-exported for the Haiku prompt. */
export const CANONICAL_TOPIC_SLUGS = ALL_TOPICS;
export const CANONICAL_AUDIENCE_SLUGS = LIBRARY_AUDIENCES;
