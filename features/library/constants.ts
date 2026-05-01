import { ALL_TOPICS, type TopicSlug } from "../../lib/topic-config";

export const LIBRARY_TOPIC_TAGS = ALL_TOPICS;

export const LIBRARY_INTENT_TAGS = [
  "understanding",
  "practical_ideas",
  "expression",
  "reflection",
  "reconnection",
  "exploration",
] as const;

export const LIBRARY_CONTENT_TYPES = ["article", "audio", "guide", "faq", "script", "video", "book_recommendation", "quickly"] as const;

export const LIBRARY_DOCUMENT_TYPES = ["article", "audio", "guide", "faq", "script", "video"] as const;

export const LIBRARY_SECTIONS = [
  "tips_educacion_sexual",   // Tips educación sexual para todos
  "te_recomiendo",           // Te recomiendo
  "lo_mas_hablado",          // Lo más hablado
  "te_ha_pasado",            // ¿Te ha pasado?
  "quickly",                 // QuicKly / Fast Question
  "emocionalmente",          // Emocional-mente
  "soy_normal_o_distinto",   // ¿Soy normal o solo distinto?
  "tengo_miedo",             // Tengo miedo
] as const;

export const LIBRARY_AUDIENCES = [
  "hombres", "mujeres", "parejas", "adolescentes", "edad_madura", "todos",
] as const;

export type LibraryTopicTag = TopicSlug;
export type LibraryIntentTag = (typeof LIBRARY_INTENT_TAGS)[number];
export type LibraryContentType = (typeof LIBRARY_CONTENT_TYPES)[number];
export type LibrarySection = (typeof LIBRARY_SECTIONS)[number];
export type LibraryAudience = (typeof LIBRARY_AUDIENCES)[number];
