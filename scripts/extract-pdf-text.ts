/**
 * Extract text from Flavia's PDF columns and book summaries
 *
 * Usage: npx tsx scripts/extract-pdf-text.ts
 *
 * Note: Requires `pdf-parse` — install with `npm install pdf-parse`
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";

const PDF_DIR = path.join(__dirname, "flavia-knowledge", "pdfs");
const OUTPUT_DIR = path.join(__dirname, "flavia-knowledge", "pdf-extracts");

async function extractPdf(filePath: string): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const buffer = fs.readFileSync(filePath);
  const uint8 = new Uint8Array(buffer);
  const parser = new PDFParse(uint8) as any;
  await parser.load();
  const result = await parser.getText();
  return result.text ?? String(result);
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(PDF_DIR).filter((f) => f.endsWith(".pdf"));

  console.log(`Found ${files.length} PDFs to extract.\n`);

  for (const file of files) {
    const filePath = path.join(PDF_DIR, file);
    const outputName = file.replace(".pdf", ".txt");
    const outputPath = path.join(OUTPUT_DIR, outputName);

    console.log(`Extracting: ${file}`);

    try {
      const text = await extractPdf(filePath);
      const cleaned = text
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      const header = `# Extracted from: ${file}\n# Method: pdf-parse\n\n`;
      fs.writeFileSync(outputPath, header + cleaned, "utf-8");
      console.log(`  → ${outputName} (${cleaned.length} chars)`);
    } catch (err: any) {
      console.error(`  ✗ Error: ${err.message}`);
    }
  }

  console.log("\nDone. Extracts saved to:", OUTPUT_DIR);
}

main().catch(console.error);
