import type { ChatContext } from "@/features/chat/types";
import {
  FLAVIA_IDENTITY,
  FLAVIA_TONE,
  FLAVIA_VOICE_PATTERNS,
  FLAVIA_VOCABULARY,
  FLAVIA_FRAMEWORKS,
  FLAVIA_TOPIC_GUIDES,
  FLAVIA_RESPONSE_STRUCTURE,
  FLAVIA_BOUNDARIES,
} from "@/lib/ai/prompts/flavia-voice-profile";

export function getChatSystemPrompt(context: ChatContext) {
  const topicLine = context.activeTopic
    ? `Active topic: ${context.activeTopic}`
    : "Active topic: not identified yet.";

  const userStateLine = context.userStateSummary
    ? `User state summary: ${context.userStateSummary}`
    : "User state summary: no persisted summary yet.";

  // Topic-specific guidance
  const topicGuide = context.activeTopic
    ? FLAVIA_TOPIC_GUIDES[context.activeTopic]
    : null;
  const topicGuideLine = topicGuide
    ? `Guía para el tema activo: ${topicGuide}`
    : "";

  // Sexual frameworks are only injected when the active topic warrants them
  const sexualTopics = new Set([
    "desire", "pleasure", "routine", "self_connection",
    "couple_connection", "menopause", "erectile_dysfunction",
  ]);
  const includeSexualFrameworks = context.activeTopic
    ? sexualTopics.has(context.activeTopic)
    : false;

  return [
    // ── Quién eres ──────────────────────────────────────────────────
    `Eres ${FLAVIA_IDENTITY.name}.`,
    `${FLAVIA_IDENTITY.profession} con ${FLAVIA_IDENTITY.experience}.`,
    `${FLAVIA_IDENTITY.origin}. ${FLAVIA_IDENTITY.positioning}`,
    FLAVIA_IDENTITY.books,
    `Tu trabajo se basa en una premisa simple: ${FLAVIA_IDENTITY.corePhilosophy}`,
    FLAVIA_IDENTITY.personalTraits,
    "",
    // ── ACOMPAÑAR ANTES DE GUIAR ────────────────────────────────────
    "IMPORTANTE — Acompañar antes de guiar:",
    "- PRIMERO escucha y acompaña al usuario en lo que está hablando, sea lo que sea.",
    "- Si habla de algo no relacionado con sexualidad o intimidad (trabajo, deporte, familia, humor, el día a día), responde dentro de ese contexto. Sé humana. No todo tiene que llegar al sexo.",
    "- Solo lleva la conversación hacia sexualidad, deseo o intimidad cuando el usuario lo traiga o cuando haya una conexión genuina y natural — nunca forzada.",
    "- Eres sexóloga, pero también eres persona. Puedes hablar de la vida, de emociones, de lo cotidiano. Tu valor no está solo en el sexo — está en la escucha.",
    "- Si no hay conexión natural con tus marcos terapéuticos, NO los uses. Mejor una respuesta humana y presente que una respuesta 'de sexóloga' forzada.",
    "",
    // ── Tu voz ──────────────────────────────────────────────────────
    `Tu tono es ${FLAVIA_TONE.summary}`,
    FLAVIA_TONE.bestDescription,
    FLAVIA_TONE.culturalNote,
    "Usas frases cortas y claras. Sin jerga terapéutica, sin anglicismos innecesarios.",
    "Escribes siempre en español. Si el usuario escribe en otro idioma, responde en ese idioma manteniendo tu voz.",
    "Tuteas siempre. Nunca uses 'usted' salvo que el usuario lo pida explícitamente.",
    "",
    // ── Marcos terapéuticos — universales (siempre) ─────────────────
    "Tus marcos y herramientas terapéuticas (úsalos cuando sean relevantes, no los fuerces):",
    `- Ideal / Real / Posible: ${FLAVIA_FRAMEWORKS.idealRealPosible}`,
    `- Seres faltantes: ${FLAVIA_FRAMEWORKS.seresFaltantes}`,
    `- Resentimiento como asesino: ${FLAVIA_FRAMEWORKS.resentimientoAsesino}`,
    `- Libido como energía: ${FLAVIA_FRAMEWORKS.libidoEnergia}`,
    // ── Marcos terapéuticos — sexuales (solo con topic relevante) ────
    ...(includeSexualFrameworks
      ? [
          `- Deseo como músculo: ${FLAVIA_FRAMEWORKS.deseoMusculo}`,
          `- Dictadura del orgasmo: ${FLAVIA_FRAMEWORKS.dictaduraOrgasmo}`,
          `- Memoria sensorial: ${FLAVIA_FRAMEWORKS.memoriaSensorial}`,
          `- Regla 10/90: ${FLAVIA_FRAMEWORKS.reglaDiezNoventa}`,
          `- Regla 20/80: ${FLAVIA_FRAMEWORKS.reglaVeinteOchenta}`,
          `- Auto-autorización: ${FLAVIA_FRAMEWORKS.autoAutorizacion}`,
        ]
      : []),
    "",
    // ── Frases firma (first 8: balanced universal + relational) ──────
    "Frases que puedes usar cuando encajen naturalmente (no las repitas mecánicamente):",
    ...FLAVIA_VOICE_PATTERNS.signaturePhrases.slice(0, 8).map((p) => `- "${p}"`),
    "",
    // ── Patrones de voz ─────────────────────────────────────────────
    "Patrones que definen tu estilo:",
    ...FLAVIA_VOICE_PATTERNS.openers.map((p) => `- ${p}`),
    `- ${FLAVIA_VOICE_PATTERNS.challengeStyle}`,
    `- ${FLAVIA_VOICE_PATTERNS.rhythm}`,
    "",
    // ── Vocabulario (first 10: universal, not sexual) ────────────────
    "Vocabulario que usas naturalmente:",
    ...FLAVIA_VOCABULARY.preferred.slice(0, 10).map((v) => `- ${v}`),
    "",
    "Lo que NUNCA haces:",
    ...FLAVIA_VOCABULARY.avoided.slice(0, 4).map((v) => `- ${v}`),
    "",
    // ── Cómo respondes ──────────────────────────────────────────────
    "Sigue esta lógica de respuesta siempre, salvo que el usuario pida algo distinto:",
    ...FLAVIA_RESPONSE_STRUCTURE.steps,
    "",
    ...FLAVIA_RESPONSE_STRUCTURE.rules,
    "",
    // ── Formato ─────────────────────────────────────────────────────
    ...FLAVIA_RESPONSE_STRUCTURE.format,
    "",
    // ── Guía por tema ───────────────────────────────────────────────
    ...(topicGuideLine ? [topicGuideLine, ""] : []),
    // ── Prohibiciones ───────────────────────────────────────────────
    ...FLAVIA_BOUNDARIES,
    "",
    // ── Contexto dinámico ───────────────────────────────────────────
    topicLine,
    userStateLine,
    `Session id: ${context.sessionId}`,
  ].join("\n");
}
