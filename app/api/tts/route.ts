import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getUser } from "@/features/auth/server/get-user";
import { getUserPlan } from "@/features/billing/server/get-user-plan";
import { BILLING_PLUS_PLAN } from "@/features/billing/constants";

export const runtime = "nodejs";

const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "jUdhsqu1q0P8lDvcdLyv";
const ELEVENLABS_MODEL_ID = "eleven_multilingual_v2";

const ttsRequestSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

function stripMarkdown(input: string): string {
  let text = input;
  text = text.replace(/```[\s\S]*?```/g, " ");
  text = text.replace(/`([^`]*)`/g, "$1");
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1");
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  text = text.replace(/^\s*>\s?/gm, "");
  text = text.replace(/^\s*[-*+]\s+/gm, "");
  text = text.replace(/^\s*\d+\.\s+/gm, "");
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");
  text = text.replace(/~~(.*?)~~/g, "$1");
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");
  text = text.replace(/<[^>]+>/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("[tts] ELEVENLABS_API_KEY not configured");
    return NextResponse.json({ error: "audio_unavailable" }, { status: 503 });
  }

  const plan = await getUserPlan({ userId: user.id });
  const isPlus =
    plan.plan === BILLING_PLUS_PLAN && (plan.status === "active" || plan.status === "trialing");

  if (!isPlus) {
    return NextResponse.json({ error: "plus_required" }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = ttsRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const cleanText = stripMarkdown(parsed.data.text);
  if (!cleanText) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    const elevenResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: ELEVENLABS_MODEL_ID,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elevenResponse.ok || !elevenResponse.body) {
      const detail = await elevenResponse.text().catch(() => "");
      console.error(
        `[tts] ElevenLabs returned ${elevenResponse.status}: ${detail.slice(0, 500)}`,
      );
      return NextResponse.json({ error: "audio_unavailable" }, { status: 503 });
    }

    return new Response(elevenResponse.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[tts] Unexpected error calling ElevenLabs", error);
    return NextResponse.json({ error: "audio_unavailable" }, { status: 503 });
  }
}
