import { CHAT_TOPICS } from "@/features/chat/constants";
import type { ChatMessage } from "@/features/chat/types";

type TopicDetectionPromptParams = {
  recentMessages: ChatMessage[];
};

export function getTopicDetectionPrompt({ recentMessages }: TopicDetectionPromptParams) {
  const conversationSnippet = recentMessages
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  return [
    "Clasifica el tema principal de esta conversación sobre bienestar íntimo.",
    "Temas permitidos:",
    `- desire: deseo sexual, libido, ganas, excitación, falta de deseo`,
    `- couple_connection: conexión de pareja, distancia emocional, reconexión, rutina de pareja`,
    `- self_connection: relación con una misma, autoestima, identidad sexual, autoconocimiento`,
    `- communication: comunicación en pareja, conversaciones difíciles, expresar necesidades`,
    `- body_confidence: relación con el cuerpo, imagen corporal, vergüenza, aceptación`,
    `- routine: rutina sexual, monotonía, aburrimiento, novedad`,
    `- curiosity: curiosidad sexual, prácticas, orientación, exploración`,
    "",
    `Solo puedes devolver uno de estos valores: ${CHAT_TOPICS.join(", ")}.`,
    'Devuelve exactamente un token: un tema permitido, o "null" si ninguno es claramente dominante.',
    "No expliques tu respuesta.",
    "",
    "Conversación:",
    conversationSnippet,
  ].join("\n");
}
