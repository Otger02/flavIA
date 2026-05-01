/**
 * Seed two book documents in Sanity (placeholders).
 *
 * Cover images and PDF assets are NOT uploaded by this script — that
 * happens manually in Sanity Studio (or via a follow-up script with the
 * actual asset files).
 *
 * Usage:
 *   1. Make sure SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION
 *      and SANITY_WRITE_TOKEN are set in .env.local.
 *   2. Run: npx tsx scripts/seed-books.ts
 *
 * Idempotent: deterministic _id (`book-<slug>`) + createOrReplace.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@sanity/client";

type SeedBook = {
  slug: string;
  title: string;
  subtitle: string;
  description: string[];
  teaserExcerpt: string[];
  pages: number;
  priceCop: number;
  externalLinks: Array<{ name: string; url: string }>;
  publishedAt: string;
};

const BOOKS: SeedBook[] = [
  {
    slug: "infidelidad",
    title: "Infidelidad",
    subtitle:
      "Por qué pasa, qué hacemos con el dolor y cómo (a veces) se sale adelante.",
    description: [
      "Un libro sobre la infidelidad que no juzga ni romantiza. Flavia distingue infidelidad de deslealtad, explora qué busca quien fue infiel — casi siempre algo de sí mismo, no del otro — y acompaña a las parejas que deciden seguir adelante.",
      "Para lectoras y lectores que quieren entender la dinámica completa antes de tomar una decisión: el dolor es válido, la decisión es de cada quien, y la conversación es la única salida que no deja heridas escondidas.",
    ],
    teaserExcerpt: [
      "La infidelidad casi nunca es contra la pareja — es sobre uno mismo. Quien es infiel busca recuperar una parte de sí mismo que siente perdida: vitalidad, juventud, identidad. El otro juega un papel pequeño en esa dinámica, aunque desde fuera parezca el centro.",
      "Eso no justifica el daño. Pero sí lo explica. Y entender por dónde viene la herida es el primer paso para decidir qué se hace con ella.",
    ],
    pages: 240,
    priceCop: 30000,
    externalLinks: [],
    publishedAt: "2026-04-30T10:00:00.000Z",
  },
  {
    slug: "sexo-sin-misterios",
    title: "Sexo sin Misterios",
    subtitle:
      "Lo que nadie te enseñó sobre placer, deseo, anatomía y la vida sexual real.",
    description: [
      "Una guía directa sin tabúes — desde la primera vez hasta la sexualidad en la tercera edad, pasando por anorgasmia, eyaculación precoz, fantasías, orientación, y todos los temas sobre los que no se habla en familia.",
      "Para quien quiere desmontar los mitos heredados y construir su propia normalidad sexual con información, comunicación y curiosidad — no con vergüenza.",
    ],
    teaserExcerpt: [
      "No existe un manual de sexo normal. Lo saludable se define por cómo se mira al otro: si hay comunicación, respeto y placer mutuo, eso es lo \"normal\" que importa.",
      "La normalidad sexual cambia con la cultura, la época, el contexto. Tu normalidad la construyes tú, no la recibes.",
    ],
    pages: 320,
    priceCop: 30000,
    externalLinks: [],
    publishedAt: "2026-04-30T10:05:00.000Z",
  },
];

function paragraphsToPortableText(paragraphs: string[]) {
  return paragraphs.map((text, index) => ({
    _key: `block-${index}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `span-${index}`, _type: "span", marks: [], text }],
  }));
}

function externalLinksToSanity(
  links: Array<{ name: string; url: string }>,
) {
  return links.map((link, index) => ({
    _key: `link-${index}`,
    _type: "externalLink",
    name: link.name,
    url: link.url,
  }));
}

async function main() {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const apiVersion = process.env.SANITY_API_VERSION ?? "2026-04-05";
  const token = process.env.SANITY_WRITE_TOKEN;

  if (!projectId || !dataset) {
    throw new Error("Missing SANITY_PROJECT_ID or SANITY_DATASET in .env.local");
  }
  if (!token) {
    throw new Error(
      "Missing SANITY_WRITE_TOKEN in .env.local. Generate one in Sanity → API → Tokens (Editor or higher).",
    );
  }

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

  console.log(`Seeding ${BOOKS.length} books to ${projectId}/${dataset}...`);
  console.log(
    "NOTE: cover images and PDF files are not uploaded by this script. Add them manually in Sanity Studio.",
  );

  for (const book of BOOKS) {
    const _id = `book-${book.slug}`;
    const doc = {
      _id,
      _type: "book",
      title: book.title,
      slug: { _type: "slug", current: book.slug },
      subtitle: book.subtitle,
      description: paragraphsToPortableText(book.description),
      teaserExcerpt: paragraphsToPortableText(book.teaserExcerpt),
      priceCop: book.priceCop,
      pages: book.pages,
      externalLinks: externalLinksToSanity(book.externalLinks),
      publishedAt: book.publishedAt,
      isAvailable: true,
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${book.slug}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
