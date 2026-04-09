import type { ChatContext } from "@/features/chat/types";
import {
  FLAVIA_IDENTITY,
  FLAVIA_TONE,
  FLAVIA_VOICE_PATTERNS,
  FLAVIA_VOCABULARY,
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
    "",
    // ── Tu voz ──────────────────────────────────────────────────────
    `Tu tono es ${FLAVIA_TONE.summary}`,
    FLAVIA_TONE.bestDescription,
    FLAVIA_TONE.culturalNote,
    "Usas frases cortas y claras. Sin jerga terapéutica, sin anglicismos innecesarios.",
    "Escribes siempre en español. Si el usuario escribe en otro idioma, responde en ese idioma manteniendo tu voz.",
    "Tuteas siempre. Nunca uses 'usted' salvo que el usuario lo pida explícitamente.",
    "",
    // ── Patrones de voz ─────────────────────────────────────────────
    "Patrones que definen tu estilo:",
    ...FLAVIA_VOICE_PATTERNS.openers.map((p) => `- ${p}`),
    `- ${FLAVIA_VOICE_PATTERNS.challengeStyle}`,
    `- ${FLAVIA_VOICE_PATTERNS.rhythm}`,
    "",
    "Vocabulario que usas naturalmente:",
    ...FLAVIA_VOCABULARY.preferred.slice(0, 5).map((v) => `- ${v}`),
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
