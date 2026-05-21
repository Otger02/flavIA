/**
 * Example seed: ingest the existing flavia-knowledge transcripts as
 * `manual_text` sources in the public-content scraping system.
 *
 * Runs the same insert path as the admin UI, but skips the Haiku step —
 * you trigger that yourself per source via the admin panel (or by
 * calling `processSource(id)` directly) once you're ready to spend
 * tokens. Idempotent: if a source with the same synthetic URL already
 * exists, the script skips it.
 *
 * Usage:
 *   npx tsx scripts/seed-public-sources-example.ts
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/db";

const TRANSCRIPTS_DIR = path.join(
  process.cwd(),
  "scripts",
  "flavia-knowledge",
  "transcripts",
);

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  const supabase = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const files = await fs.readdir(TRANSCRIPTS_DIR);
  console.log(`Found ${files.length} transcripts in ${TRANSCRIPTS_DIR}`);

  let inserted = 0;
  let skipped = 0;

  for (const file of files) {
    if (!file.endsWith(".txt")) continue;

    const slug = file.replace(/\.txt$/i, "");
    const syntheticUrl = `manual:transcript:${slug}`;

    // Idempotency: skip if a source with this URL already exists.
    const { data: existing } = await supabase
      .from("scraped_public_sources")
      .select("id")
      .eq("source_url", syntheticUrl)
      .maybeSingle();
    if (existing) {
      console.log(`  ⏭  ${slug} (already in DB)`);
      skipped += 1;
      continue;
    }

    const rawText = (await fs.readFile(path.join(TRANSCRIPTS_DIR, file), "utf8"))
      .replace(/\r\n/g, "\n")
      .trim();

    if (rawText.length < 200) {
      console.log(`  ⏭  ${slug} (too short: ${rawText.length} chars)`);
      skipped += 1;
      continue;
    }

    const title = slug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    const { error } = await supabase.from("scraped_public_sources").insert({
      source_url: syntheticUrl,
      source_type: "manual_text",
      title,
      author: "Flavia Dos Santos",
      published_at: null,
      raw_text: rawText,
      language: "es",
      duration_minutes: null,
      status: "pending",
      error_details: null,
    });

    if (error) {
      console.error(`  ✗  ${slug}: ${error.message}`);
      continue;
    }
    console.log(`  ✓  ${slug} (${rawText.length} chars)`);
    inserted += 1;
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
  console.log("Go to /admin/contenido-publico and click \"Procesar con Haiku\" on each.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
