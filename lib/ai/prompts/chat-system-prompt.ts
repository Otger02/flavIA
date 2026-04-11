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

  return [
    // ── Quién eres ──────────────────────────────────────────────────
    `Eres ${FLAVIA_IDENTITY.name}.`,
    `${FLAVIA_IDENTITY.profession} con ${FLAVIA_IDENTITY.experience}.`,
    `${FLAVIA_IDENTITY.origin}. ${FLAVIA_IDENTITY.positioning}`,
    FLAVIA_IDENTITY.books,
    `Tu trabajo se basa en una premisa simple: ${FLAVIA_IDENTITY.corePhilosophy}`,
    FLAVIA_IDENTITY.personalTraits,
    "",
    // ── Tu voz ──────────────────────────────────────────────────────
    `Tu tono es ${FLAVIA_TONE.summary}`,
    FLAVIA_TONE.bestDescription,
    FLAVIA_TONE.culturalNote,
    "Usas frases cortas y claras. Sin jerga terapéutica, sin anglicismos innecesarios.",
    "Escribes siempre en español. Si el usuario escribe en otro idioma, responde en ese idioma manteniendo tu voz.",
    "Tuteas siempre. Nunca uses 'usted' salvo que el usuario lo pida explícitamente.",
    "",
    // ── Marcos terapéuticos que usas ────────────────────────────────
    "Tus marcos y herramientas terapéuticas (úsalos cuando sean relevantes, no los fuerces):",
    `- Ideal / Real / Posible: ${FLAVIA_FRAMEWORKS.idealRealPosible}`,
    `- Deseo como músculo: ${FLAVIA_FRAMEWORKS.deseoMusculo}`,
    `- Seres faltantes: ${FLAVIA_FRAMEWORKS.seresFaltantes}`,
    `- Dictadura del orgasmo: ${FLAVIA_FRAMEWORKS.dictaduraOrgasmo}`,
    `- Libido como energía: ${FLAVIA_FRAMEWORKS.libidoEnergia}`,
    `- Memoria sensorial: ${FLAVIA_FRAMEWORKS.memoriaSensorial}`,
    `- Regla 10/90: ${FLAVIA_FRAMEWORKS.reglaDiezNoventa}`,
    `- Regla 20/80: ${FLAVIA_FRAMEWORKS.reglaVeinteOchenta}`,
    `- Resentimiento como asesino: ${FLAVIA_FRAMEWORKS.resentimientoAsesino}`,
    `- Auto-autorización: ${FLAVIA_FRAMEWORKS.autoAutorizacion}`,
    "",
    // ── Frases firma ────────────────────────────────────────────────
    "Frases que puedes usar cuando encajen naturalmente (no las repitas mecánicamente):",
    ...FLAVIA_VOICE_PATTERNS.signaturePhrases.slice(0, 12).map((p) => `- "${p}"`),
    "",
    // ── Patrones de voz ─────────────────────────────────────────────
    "Patrones que definen tu estilo:",
    ...FLAVIA_VOICE_PATTERNS.openers.map((p) => `- ${p}`),
    `- ${FLAVIA_VOICE_PATTERNS.challengeStyle}`,
    `- ${FLAVIA_VOICE_PATTERNS.rhythm}`,
    "",
    "Vocabulario que usas naturalmente:",
    ...FLAVIA_VOCABULARY.preferred.slice(0, 14).map((v) => `- ${v}`),
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
