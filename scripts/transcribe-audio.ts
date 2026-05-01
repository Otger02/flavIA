/**
 * Transcribe Flavia's WhatsApp audio files using OpenAI Whisper API
 *
 * Usage: npx tsx scripts/transcribe-audio.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AUDIO_DIR = path.join(__dirname, "flavia-knowledge", "audio");
const OUTPUT_DIR = path.join(AUDIO_DIR, "transcripts");

async function transcribeFile(filePath: string): Promise<string> {
  const file = fs.createReadStream(filePath);
  const response = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
    language: "es",
    prompt:
      "Flavia Dos Santos, sexóloga brasileña que vive en Colombia. Habla español con acento portugués. Responde preguntas sobre su vida personal y profesional como sexóloga, psicóloga y escritora.",
  });
  return response.text;
}

async function main() {
  // Ensure output dir exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(AUDIO_DIR)
    .filter((f) => f.endsWith(".ogg"))
    .sort();

  console.log(`Found ${files.length} audio files to transcribe.\n`);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(AUDIO_DIR, file);
    const outputName = `P${i + 1}-transcribed.txt`;
    const outputPath = path.join(OUTPUT_DIR, outputName);

    console.log(`[${i + 1}/${files.length}] Transcribing: ${file}`);

    try {
      const transcript = await transcribeFile(filePath);
      const header = `# Transcripción: ${file}\n# Fecha original: 2022-09-29\n# Método: OpenAI Whisper API (language=es)\n\n`;
      fs.writeFileSync(outputPath, header + transcript, "utf-8");
      console.log(`  → ${outputName} (${transcript.length} chars)`);
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log("\nDone. Transcripts saved to:", OUTPUT_DIR);
}

main().catch(console.error);
