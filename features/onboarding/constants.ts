/**
 * Canonical option lists for the 3-screen onboarding flow.
 *
 * Topic slugs are intentionally narrow — only what feeds suggested
 * prompts. They are NOT the same as `LIBRARY_TOPIC_TAGS` (which is a
 * content taxonomy) or `AFFILIATE_CONTEXT_TAGS` (product detection).
 * Cross-mapping happens at render time via SUGGESTED_PROMPTS_BY_TOPIC.
 */

export const ONBOARDING_TOPICS = [
  "deseo",
  "pareja",
  "comunicacion",
  "autoconocimiento",
  "menopausia",
  "postparto",
  "primera_vez",
  "infidelidad",
  "identidad",
  "miedo",
  "otro",
] as const;

export type OnboardingTopic = (typeof ONBOARDING_TOPICS)[number];

export const ONBOARDING_TOPIC_MAX = 3;

export const ONBOARDING_RELATIONSHIP_STATUSES = [
  "soltera",
  "en_pareja",
  "casada",
  "recien_separada",
  "abierta",
  "prefiero_no_decir",
] as const;

export type OnboardingRelationshipStatus =
  (typeof ONBOARDING_RELATIONSHIP_STATUSES)[number];

/**
 * Per-topic conversation starters in Flavia's voice. First-person from
 * the user — the chat receives these as if the user typed them. Phrasing
 * mirrors lines that already appear in real Flavia transcripts and
 * library QuicKly items so they feel natural to send.
 *
 * Each topic has 3 prompts. The screen 3 picker dedupes across the
 * user's topic selection (max 3 unique starters shown total).
 */
export const SUGGESTED_PROMPTS_BY_TOPIC: Record<OnboardingTopic, readonly string[]> = {
  deseo: [
    "Siento que el deseo se me apagó y no sé por qué.",
    "Llevamos tiempo juntos y ya no me dan ganas como antes.",
    "Quiero entender por qué a veces no tengo ganas.",
  ],
  pareja: [
    "Llevamos años juntos y siento que estamos en piloto automático.",
    "Mi pareja y yo ya no hablamos como antes.",
    "Quiero reconectar con mi pareja pero no sé por dónde empezar.",
  ],
  comunicacion: [
    "Me cuesta hablar de lo que me gusta en la cama.",
    "Hay algo que necesito decirle a mi pareja y no me atrevo.",
    "Quiero aprender a pedir lo que quiero sin sentir culpa.",
  ],
  autoconocimiento: [
    "Quiero conocer mejor mi cuerpo y lo que me gusta.",
    "Siento que no sé qué me da placer realmente.",
    "Me gustaría reconectar conmigo misma.",
  ],
  menopausia: [
    "Empecé la menopausia y todo está cambiando.",
    "Siento que mi cuerpo ya no es el mismo.",
    "Tengo miedo de que el sexo se acabe ahora.",
  ],
  postparto: [
    "Desde que tuve a mi bebé no me reconozco.",
    "No tengo ganas de sexo y mi pareja insiste.",
    "Mi cuerpo cambió después del parto y no sé cómo sentirme con eso.",
  ],
  primera_vez: [
    "Estoy pensando en tener mi primera vez y tengo dudas.",
    "Quiero estar segura antes de dar este paso.",
    "Tengo miedo de que duela o de no disfrutar.",
  ],
  infidelidad: [
    "Algo pasó y mi pareja y yo no sabemos cómo seguir.",
    "Descubrí algo y no sé qué hacer con lo que siento.",
    "Quiero entender por qué pasó antes de decidir nada.",
  ],
  identidad: [
    "Estoy explorando mi orientación y tengo más preguntas que respuestas.",
    "Sentí algo nuevo y no sé qué hacer con eso.",
    "Quiero conocerme sin etiquetas todavía.",
  ],
  miedo: [
    "Tengo miedo a la intimidad y no sé de dónde viene.",
    "Algo me pasó en el pasado y todavía me afecta.",
    "Me bloqueo cuando llega el momento.",
  ],
  otro: [
    "Hay algo que me ronda hace tiempo y quiero hablar.",
    "No estoy segura de qué necesito, pero quiero conversar.",
    "Quiero entender qué me está pasando.",
  ],
};

/**
 * Used when the user skipped screen 2 entirely. Warm, generic openers
 * that work regardless of life situation.
 */
export const GENERIC_SUGGESTED_PROMPTS: readonly string[] = [
  "Quiero hablar de algo que llevo pensando hace tiempo.",
  "No estoy segura de por dónde empezar, ¿me ayudas?",
  "Cuéntame, ¿qué tipo de conversaciones tienes con la gente que llega aquí?",
];
