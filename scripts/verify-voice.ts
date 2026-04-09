/**
 * Voice Verification Script
 *
 * Sends test conversations to OpenAI using the exact same system prompt
 * the app uses, then prints Flavia's responses for human review.
 *
 * Usage: npx tsx scripts/verify-voice.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import OpenAI from "openai";

// Import the actual system prompt builder and voice profile
import { getChatSystemPrompt } from "../lib/ai/prompts/chat-system-prompt";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Test scenarios ─────────────────────────────────────────────────────
interface TestScenario {
  name: string;
  topic: string | null;
  messages: string[]; // alternating user messages (Flavia responds after each)
}

const scenarios: TestScenario[] = [
  {
    name: "🔥 Deseo perdido en pareja larga",
    topic: "desire",
    messages: [
      "Llevo 12 años con mi pareja y ya no siento deseo. Lo quiero, pero no me atrae. ¿Es normal?",
      "Es que siento que si no deseo sexo es porque algo está mal en mí.",
      "¿Y qué hago? Porque él lo pide y yo me siento culpable.",
    ],
  },
  {
    name: "💬 No sé cómo hablar de lo que quiero en la cama",
    topic: "communication",
    messages: [
      "Nunca he sido capaz de decirle a mi pareja lo que me gusta en la cama. Me da mucha vergüenza.",
      "Es que me da miedo que piense que soy rara o que lo que pido es demasiado.",
    ],
  },
  {
    name: "🌡️ Menopausia y sexualidad",
    topic: "menopause",
    messages: [
      "Tengo 52 años y desde la menopausia siento que mi vida sexual se acabó. Todo me duele y no tengo ganas de nada.",
      "Mi ginecólogo me dijo que es normal y que me acostumbre. ¿Es así?",
    ],
  },
  {
    name: "😤 Celos que no puedo controlar",
    topic: "jealousy",
    messages: [
      "Los celos me están destruyendo. Reviso el teléfono de mi pareja cada noche y no puedo parar.",
    ],
  },
  {
    name: "🧘 Reconectar con mi cuerpo",
    topic: "body_confidence",
    messages: [
      "Después de tener hijos mi cuerpo cambió mucho y me cuesta sentirme atractiva. Evito que mi pareja me vea desnuda.",
      "Es que antes me gustaba mi cuerpo y ahora no me reconozco.",
    ],
  },
  {
    name: "🔍 Curiosidad por explorar",
    topic: "curiosity",
    messages: [
      "Tengo curiosidad por usar juguetes sexuales pero me da vergüenza comprarlo y no sé ni por dónde empezar.",
    ],
  },
  {
    name: "⚡ Erección perdida",
    topic: "erectile_dysfunction",
    messages: [
      "A veces pierdo la erección durante el sexo y me da tanta vergüenza que prefiero no intentarlo.",
      "Es que mi pareja dice que no pasa nada pero yo sé que se frustra.",
    ],
  },
  {
    name: "🌀 Rutina que mata",
    topic: "routine",
    messages: [
      "Nuestro sexo es siempre igual. Misma posición, mismo momento, mismo resultado. Me aburro pero no sé cómo cambiarlo sin herir a mi pareja.",
    ],
  },
  {
    name: "💭 Primer mensaje sin tema (cold start)",
    topic: null,
    messages: [
      "Hola, no sé muy bien qué decir. Solo sé que algo no funciona en mi relación y no sé a quién preguntarle.",
    ],
  },
  {
    name: "🔒 Poner límites",
    topic: "boundaries",
    messages: [
      "Mi pareja quiere probar cosas que a mí no me gustan y me siento culpable por decir que no.",
      "Es que me dice que si lo quisiera de verdad lo haría.",
    ],
  },
];

// ── Runner ─────────────────────────────────────────────────────────────
async function runScenario(scenario: TestScenario) {
  const systemPrompt = getChatSystemPrompt({
    activeTopic: scenario.topic,
    userStateSummary: null,
    sessionId: "test-" + Date.now(),
  } as any);

  const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  console.log(`\n${"═".repeat(70)}`);
  console.log(`  ${scenario.name}`);
  console.log(`  Tema: ${scenario.topic ?? "(ninguno)"}`);
  console.log(`${"═".repeat(70)}`);

  for (const userMsg of scenario.messages) {
    conversationMessages.push({ role: "user", content: userMsg });

    console.log(`\n  👤 Usuario: ${userMsg}`);

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: conversationMessages,
      temperature: 0.85,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content ?? "(sin respuesta)";
    conversationMessages.push({ role: "assistant", content: reply });

    console.log(`\n  🌹 Flavia: ${reply}`);
    console.log(`  ${"─".repeat(66)}`);
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║          VERIFICACIÓN DE VOZ — Flavia Dos Santos                    ║");
  console.log("║          Modelo: gpt-4.1-mini | Temperatura: 0.85                   ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");

  for (const scenario of scenarios) {
    await runScenario(scenario);
  }

  console.log(`\n${"═".repeat(70)}`);
  console.log("  ✅ Verificación completa — revisa las respuestas arriba.");
  console.log(`${"═".repeat(70)}\n`);
}

main().catch(console.error);
