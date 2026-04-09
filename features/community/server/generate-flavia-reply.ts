import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateChatResponse } from "@/lib/ai/client";
import { FLAVIA_IDENTITY, FLAVIA_TONE, FLAVIA_VOICE_PATTERNS, FLAVIA_BOUNDARIES } from "@/lib/ai/prompts/flavia-voice-profile";
import { moderateContent } from "./moderate-content";

type GenerateFlaviaReplyInput = {
  threadId: string;
  threadTitle: string;
  threadBody: string;
  recentReplies: string[];
};

export async function generateFlaviaReply(input: GenerateFlaviaReplyInput): Promise<
  { ok: true; commentId: string } | { ok: false; error: string }
> {
  const { threadId, threadTitle, threadBody, recentReplies } = input;

  const repliesContext = recentReplies.length > 0
    ? `\n\nRespuestas recientes de la comunidad:\n${recentReplies.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : "";

  const systemPrompt = `${FLAVIA_IDENTITY.name} — ${FLAVIA_IDENTITY.profession}

${FLAVIA_TONE.summary}

CONTEXTO: Estas respondiendo en un foro de comunidad. El tono es cercano pero publico — no es una sesion privada.

INSTRUCCIONES:
- Responde como ${FLAVIA_IDENTITY.name} responderia en una conversacion publica
- Se cercana, directa y empatica
- No des diagnosticos ni referencias a sesiones privadas
- Maximo 2-3 parrafos cortos
${FLAVIA_VOICE_PATTERNS.rhythm}
${FLAVIA_BOUNDARIES.join("\n")}`;

  const userMessage = `Titulo del hilo: ${threadTitle}\n\nContenido: ${threadBody}${repliesContext}\n\nEscribe tu respuesta como Flavia:`;

  const now = new Date().toISOString();
  const response = await generateChatResponse({
    sessionId: `community-${threadId}`,
    systemPrompt: systemPrompt,
    activeTopic: null,
    userStateSummary: null,
    recentMessages: [
      { id: "usr", sessionId: `community-${threadId}`, role: "user", content: userMessage, createdAt: now },
    ],
  });

  // Moderate the AI output
  const modResult = await moderateContent(response.content);
  const status = modResult.decision === "rejected" ? "hidden" as const : "published" as const;

  const supabase = await createServerSupabaseClient();

  // Get the thread creator's user_id for the FK requirement
  const { data: thread } = await supabase
    .from("community_threads")
    .select("user_id")
    .eq("id", threadId)
    .single();

  if (!thread) return { ok: false, error: "Thread not found" };

  const { data: comment, error } = await supabase
    .from("community_comments")
    .insert({
      user_id: thread.user_id,
      target_type: "thread" as const,
      target_id: threadId,
      content: response.content,
      is_anonymous: false,
      is_flavia_ai: true,
      status,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[community] flavia reply insert failed:", error);
    return { ok: false, error: "No se pudo publicar la respuesta de Flavia." };
  }

  // Log moderation
  await supabase.from("community_moderation_log").insert({
    content_type: "comment" as const,
    content_id: comment.id,
    decision: modResult.decision,
    confidence: modResult.confidence,
    reason: modResult.reason,
    model: response.model,
  });

  return { ok: true, commentId: comment.id };
}
