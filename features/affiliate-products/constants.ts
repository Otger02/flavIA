/**
 * Single source of truth for the affiliate-products taxonomies.
 *
 * Imported by:
 *   - sanity/schemaTypes/affiliateProductType.ts (constrains Studio fields)
 *   - features/affiliate-products/types.ts (Zod runtime validation)
 *   - scripts/seed-affiliate-products.ts (seed data validation)
 *
 * When Flavia adds a new partnership: add the brand slug here, the
 * display label in messages/{es,en}/affiliate.json under `brand_<slug>`,
 * and (optionally) any new context tags below.
 */

export const AFFILIATE_BRANDS = [
  "lelo",
  "platanomelon",
  "gleeden",
  "ginocanesten",
  "tena",
  "procaps",
  "dislicores_global_wines",
  "copas_menstruales",
] as const;

export type AffiliateBrand = (typeof AFFILIATE_BRANDS)[number];

export const BRAND_DISPLAY_NAMES: Record<AffiliateBrand, string> = {
  lelo: "LELO",
  platanomelon: "Platanomelón",
  gleeden: "Gleeden",
  ginocanesten: "Ginocanesten",
  tena: "TENA",
  procaps: "Procaps",
  dislicores_global_wines: "Dislicores & Global Wines",
  copas_menstruales: "Copas menstruales",
};

/**
 * Situational tags that the chat detection layer (part B) emits and that
 * affiliateProduct.contexts is constrained against.
 *
 * Intentionally broad — a product can list multiple contexts. Matching
 * is set-intersection, weighted by `priority`.
 */
export const AFFILIATE_CONTEXT_TAGS = [
  "menopausia",
  "sequedad_vaginal",
  "primera_vez",
  "juguetes_pareja",
  "incontinencia",
  "plan_romantico",
  "baja_libido",
  "salud_intima_femenina",
  "omega3_libido",
  "app_citas",
  "vinos",
  "copa_menstrual",
  "placer_femenino",
  "exploracion",
  "infidelidad_consensuada",
  "curiosidad",
  "postparto",
  "salud_general",
  "cita_pareja",
  "ciclo_menstrual",
  "sostenibilidad",
] as const;

export type AffiliateContextTag = (typeof AFFILIATE_CONTEXT_TAGS)[number];

/**
 * Free-form keyword index used by the chat detection layer when context
 * tags aren't enough on their own. Each product can contribute its own
 * keywords on top of these — these are the canonical phrases shared
 * across products.
 *
 * Kept loose (string[], not a constrained literal union) because Flavia
 * will be adding many domain-specific phrases over time.
 */
export const AFFILIATE_KEYWORDS = [
  "sequedad",
  "lubricacion",
  "menopausia",
  "pareja nueva",
  "primera vez",
  "vibrador",
  "juguete",
  "incontinencia",
  "perdidas de orina",
  "plan romantico",
  "cena especial",
  "vino",
  "deseo bajo",
  "libido baja",
  "omega 3",
  "salud intima",
  "infeccion",
  "cita",
  "app de citas",
  "copa menstrual",
  "regla",
] as const;
