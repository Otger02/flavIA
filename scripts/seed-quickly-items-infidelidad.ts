/**
 * Seed QuicKly items — extracted from "Infidelidad" by Flavia Dos Santos
 *
 * 18 Q&A items added to the QuicKly section of the library, all sourced
 * from the book. Same schema and id-generation pattern as
 * scripts/seed-quickly-items.ts (the Sexo sin Misterios seed).
 *
 * Usage:
 *   1. SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION, SANITY_WRITE_TOKEN
 *      must be in .env.local.
 *   2. Run: npx tsx scripts/seed-quickly-items-infidelidad.ts
 *
 * Idempotent: deterministic _id (`quickly-item-<slug>`) + createOrReplace.
 * Slugs derive from the question text via the same `slugify` rule as the
 * existing seed, so re-running this alongside the original seed is safe
 * as long as no question collides slug-wise (the script asserts that).
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@sanity/client";

import {
  type LibraryAudience,
  type LibraryTopicTag,
} from "@/features/library/constants";

type RawTopic =
  | "pareja"
  | "comunicacion"
  | "identidad"
  | "autoconocimiento"
  | "deseo";

const TOPIC_MAP: Record<RawTopic, LibraryTopicTag> = {
  pareja: "couple_connection",
  comunicacion: "communication",
  identidad: "identity",
  autoconocimiento: "self_connection",
  deseo: "desire",
};

type SeedItem = {
  question: string;
  answer: string;
  topics: RawTopic[];
  audience: LibraryAudience[];
  isPremium: boolean;
};

const SOURCE = "libro_infidelidad";

const ITEMS: SeedItem[] = [
  // ── Sobre la infidelidad en general ─────────────────────────────────
  {
    question: "¿Qué es realmente infidelidad?",
    answer:
      "Lo que cada pareja haya pactado que es infidelidad. No hay una definición universal. Hay parejas para las que un beso es infidelidad y otras para las que un encuentro físico no rompe el pacto. La pregunta correcta no es \"¿qué es infidelidad?\" sino \"¿qué es infidelidad para nosotros?\".",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿La infidelidad es genética o cultural?",
    answer:
      "Cultural, principalmente. Está documentada en todas las sociedades de todas las épocas, lo que sugiere algo más profundo que la cultura, pero la forma en que la castigamos, la nombramos y la perdonamos es completamente cultural. Lo natural es la diversidad sexual; la monogamia es un acuerdo social.",
    topics: ["pareja", "identidad"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Por qué dolemos tanto cuando descubrimos una infidelidad?",
    answer:
      "Porque rompe tres cosas al mismo tiempo: la confianza, la autoestima y la narrativa que teníamos de nuestra vida. No solo descubres lo que hizo el otro — descubres que tu realidad no era la que creías. Ese reajuste duele tanto como el acto.",
    topics: ["pareja", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Una infidelidad termina siempre con la pareja?",
    answer:
      "No. Muchas parejas sobreviven a infidelidades. Lo que determina si sobrevive no es el acto, es lo que se hace después: si hay verdad, trabajo, tiempo y decisión consciente.",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  // ── Sobre las mujeres y la infidelidad ──────────────────────────────
  {
    question: "¿Por qué la infidelidad femenina se juzga más duro que la masculina?",
    answer:
      "Porque venimos de una cultura patriarcal donde la sexualidad femenina ha sido controlada durante siglos. La idea de que una mujer \"buena\" no siente deseo está tan instalada que cuando una mujer es infiel rompe dos cosas: el pacto con su pareja y el pacto cultural de cómo se supone que debe ser una mujer.",
    topics: ["identidad"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Por qué son infieles las mujeres?",
    answer:
      "Casi siempre por falta de algo dentro de la pareja: falta de intimidad emocional, de conversación, de deseo, de reconocimiento. Las mujeres son infieles cuando llevan tiempo sintiéndose invisibles. La infidelidad femenina es muchas veces un grito de algo que no se atrevió a decir antes.",
    topics: ["pareja", "deseo"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Las mujeres tenemos menos deseo que los hombres?",
    answer:
      "No. Tenemos el mismo deseo o más. Lo que tenemos es siglos de represión cultural enseñándonos a disimularlo. La supuesta diferencia de deseo entre hombres y mujeres es mucho más cultural que biológica.",
    topics: ["deseo"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question:
      "¿Es verdad que las mujeres se enamoran cuando tienen sexo y los hombres no?",
    answer:
      "Es un mito. Hay mujeres que pueden tener sexo sin enamorarse y hombres que se enamoran después de un encuentro. Lo que pasa es que culturalmente se nos enseñó a las mujeres que el sexo \"necesita\" amor, y muchos hombres aprendieron a desconectar el sexo de las emociones para parecer \"masculinos\". Las dos cosas son aprendidas.",
    topics: ["pareja", "deseo"],
    audience: ["mujeres"],
    isPremium: false,
  },
  // ── Sobre los hombres y la infidelidad ──────────────────────────────
  {
    question: "¿Por qué son infieles los hombres?",
    answer:
      "Por muchas razones, no todas iguales. Pero la más común no es el deseo sexual — es la búsqueda de reafirmación. Sentirse deseados, jóvenes, potentes. La infidelidad masculina es muchas veces una crisis de identidad disfrazada de aventura.",
    topics: ["pareja", "identidad"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question: "¿Es verdad que los hombres infieles llenan algo con la otra persona?",
    answer:
      "Casi nunca. Llenan algo durante 5 minutos. Después se sienten igual o peor. La amante no resuelve nada — solo aplaza el problema real, que casi siempre está en la relación primaria o en el propio hombre.",
    topics: ["pareja"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question: "¿Por qué un hombre que ama a su pareja le es infiel?",
    answer:
      "Porque para muchos hombres, sexo y amor están separados emocionalmente desde adolescentes. Quieren a su pareja, y a la vez tienen un encuentro con otra que no les genera vínculo. Eso no significa que el amor sea falso — significa que la cultura les enseñó a compartimentar. Trabajable, pero costoso.",
    topics: ["pareja", "identidad"],
    audience: ["hombres"],
    isPremium: false,
  },
  // ── Sobre situaciones concretas ─────────────────────────────────────
  {
    question: "¿Tengo que contarle a mi pareja que le fui infiel?",
    answer:
      "Depende. Si la infidelidad sigue activa: terminala primero, después decide. Si fue puntual y terminó hace tiempo: la honestidad es importante pero no a costa de descargar tu culpa sobre el otro. Pregúntate: ¿lo cuento por ella o por mí? Si es por ti, busca terapia para procesarlo, no la conversación con tu pareja como descarga.",
    topics: ["pareja", "comunicacion"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Cómo sé si mi pareja me está siendo infiel?",
    answer:
      "Casi siempre lo intuyes. El cuerpo lo nota antes que la cabeza. Si llevas meses con la sensación de que algo no cuadra, no es paranoia — es información. Lo que sigue no es interrogarle: es conversar sobre cómo está la pareja sin acusaciones, y observar cómo responde.",
    topics: ["pareja", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Sirve perdonar una infidelidad?",
    answer:
      "Sirve si es perdón real, no perdón táctico. El perdón táctico es decir \"te perdono\" para que el otro deje de pedir disculpas y volvamos a la rutina. Ese perdón no resuelve nada. El perdón real implica entender qué pasó, qué te dolió, qué necesitas ahora, y decidir si puedes seguir sin guardar la herida como arma.",
    topics: ["pareja", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Por qué duele tanto el detalle de \"con quién\"?",
    answer:
      "Porque cuando la persona es alguien conocido — una amiga, una compañera de trabajo — duele doble: la pareja te traicionó y esa persona también. Cuando es alguien anónimo, duele de otra forma: la sensación de ser intercambiable. Cada modalidad tiene su tipo de herida.",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  // ── Sobre alternativas ──────────────────────────────────────────────
  {
    question: "¿Funcionan las relaciones abiertas?",
    answer:
      "Funcionan cuando ambos lo eligen libremente, hay reglas claras y comunicación constante. No funcionan cuando se usan para evitar problemas que ya existían. La apertura no resuelve crisis — las amplifica. Y no es para todas las parejas: requiere muchísima honestidad emocional.",
    topics: ["pareja", "comunicacion"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Qué diferencia hay entre relación abierta y poliamor?",
    answer:
      "La relación abierta permite encuentros sexuales con terceros sin vínculo afectivo. El poliamor permite relaciones afectivas con varias personas a la vez, todas conociéndose entre sí, con consentimiento mutuo. La primera es sobre sexo, la segunda es sobre amor. Pueden coexistir pero son dinámicas distintas.",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Existe la pareja perfectamente fiel toda la vida?",
    answer:
      "Existe, pero es minoría. Y eso no quiere decir que las que sí son fieles sean menos valiosas — al contrario, son admirables. Pero idealizarlas como \"el modelo correcto\" pone una presión imposible sobre las demás. Lo importante no es ser fiel siempre. Es ser leal siempre.",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/ñ/g, "n")
    .replace(/[¿?¡!,.:;"'()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueTopics(raw: RawTopic[]): string[] {
  const mapped = raw.map((value) => TOPIC_MAP[value]);
  return Array.from(new Set(mapped));
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

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(
    `Seeding ${ITEMS.length} Infidelidad QuicKly items to ${projectId}/${dataset}...`,
  );

  const seenSlugs = new Set<string>();
  let index = 0;

  for (const item of ITEMS) {
    index += 1;
    const slug = slugify(item.question);
    if (!slug) {
      throw new Error(`Could not slugify question #${index}: "${item.question}"`);
    }
    if (seenSlugs.has(slug)) {
      throw new Error(`Duplicate slug "${slug}" generated from question #${index}.`);
    }
    seenSlugs.add(slug);

    const _id = `quickly-item-${slug}`;
    const doc = {
      _id,
      _type: "quicklyItem",
      title: item.question,
      slug: { _type: "slug", current: slug },
      shortAnswer: item.answer,
      sectionTag: "quickly",
      topicTags: uniqueTopics(item.topics),
      audienceTags: item.audience,
      isPremium: item.isPremium,
      source: SOURCE,
      publishedAt: "2026-05-01T10:00:00.000Z",
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${slug}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
