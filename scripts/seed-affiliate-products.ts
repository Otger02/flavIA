/**
 * Seed 8 starter affiliate products — one per partner brand.
 *
 * Defaults:
 *   - isActive = false  (nothing leaks to users until Flavia approves)
 *   - affiliateUrl = unset (Flavia hasn't sent the links yet; the UI
 *     will hide products without a URL even when isActive=true)
 *
 * Idempotent: deterministic _id (`product-<brand>-<slug>`) +
 * createOrReplace.
 *
 * Usage:
 *   1. Make sure SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION
 *      and SANITY_WRITE_TOKEN are set in .env.local.
 *   2. Run: npx tsx scripts/seed-affiliate-products.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@sanity/client";

import {
  AFFILIATE_BRANDS,
  AFFILIATE_CONTEXT_TAGS,
  BRAND_DISPLAY_NAMES,
  type AffiliateBrand,
  type AffiliateContextTag,
} from "../features/affiliate-products/constants";
import {
  LIBRARY_AUDIENCES,
  type LibraryAudience,
} from "../features/library/constants";

type SeedProduct = {
  brand: AffiliateBrand;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string[];
  contexts: AffiliateContextTag[];
  keywords: string[];
  audienceTags: LibraryAudience[];
  priority: number;
  priceRange?: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    brand: "lelo",
    slug: "sona-2-cruise",
    title: "Sona 2 Cruise",
    shortDescription:
      "Estimulador clitoriano por ondas sónicas. Pensado para placer profundo sin contacto directo.",
    longDescription: [
      "Sona 2 Cruise usa ondas sónicas para estimular el clítoris en su totalidad — incluida la parte interna que no se ve.",
      "Para quien explora su placer en solitario o con pareja. Resistente al agua, recargable, y diseñado con materiales seguros para el cuerpo.",
    ],
    contexts: ["juguetes_pareja", "primera_vez", "placer_femenino", "exploracion"],
    keywords: ["vibrador", "succionador", "clitoris", "juguete", "placer femenino", "lelo"],
    audienceTags: ["mujeres", "parejas"],
    priority: 8,
    priceRange: "450.000 — 600.000 COP",
  },
  {
    brand: "platanomelon",
    slug: "kit-iniciacion",
    title: "Kit Iniciación",
    shortDescription:
      "Kit de juguetes pensado para quien empieza a explorar su sexualidad con curiosidad y sin presión.",
    longDescription: [
      "Una caja con productos básicos para descubrir qué te gusta — sola o en pareja. Incluye guía de uso, lubricante y juguetes diseñados para principiantes.",
      "Sin tabúes, con instrucciones claras, y empacado de forma discreta.",
    ],
    contexts: ["primera_vez", "juguetes_pareja", "exploracion", "curiosidad"],
    keywords: ["kit", "iniciacion", "primera vez", "juguete", "pareja", "platanomelon"],
    audienceTags: ["parejas", "todos"],
    priority: 7,
    priceRange: "180.000 — 250.000 COP",
  },
  {
    brand: "gleeden",
    slug: "app-gleeden",
    title: "App Gleeden",
    shortDescription:
      "Plataforma de citas para personas en relaciones abiertas o explorando conexiones nuevas con consentimiento.",
    longDescription: [
      "Gleeden es un espacio diseñado para personas que están explorando vínculos por fuera de la pareja con conocimiento y acuerdo de las partes.",
      "Tu decisión es tuya. Lo que importa es que sea tomada con honestidad, no por evasión.",
    ],
    contexts: ["app_citas", "infidelidad_consensuada", "curiosidad"],
    keywords: ["cita", "app", "gleeden", "pareja abierta", "infidelidad consensuada"],
    audienceTags: ["todos"],
    priority: 5,
  },
  {
    brand: "ginocanesten",
    slug: "crema-vaginal",
    title: "Crema vaginal",
    shortDescription:
      "Crema para sequedad vaginal — útil en menopausia, postparto o cualquier etapa con cambios hormonales.",
    longDescription: [
      "La sequedad vaginal afecta a muchas mujeres en distintas etapas de la vida. No es algo que tengas que aguantar.",
      "Esta crema hidrata y restaura el equilibrio. Consulta a tu médica antes de usar si tienes condiciones específicas.",
    ],
    contexts: ["sequedad_vaginal", "menopausia", "salud_intima_femenina"],
    keywords: ["crema vaginal", "sequedad", "lubricacion", "menopausia", "ginocanesten", "bayer"],
    audienceTags: ["mujeres", "edad_madura"],
    priority: 9,
    priceRange: "45.000 — 70.000 COP",
  },
  {
    brand: "tena",
    slug: "discreet-pads",
    title: "TENA Discreet",
    shortDescription:
      "Protección discreta para pérdidas leves de orina. Diseñada para que sigas con tu vida sin interrupciones.",
    longDescription: [
      "La incontinencia leve es más común de lo que se habla — sobre todo después del parto y en la menopausia. No es vergonzoso, es información sobre tu cuerpo.",
      "TENA Discreet ofrece protección sin que se note, para que el tema no condicione tu día.",
    ],
    contexts: ["incontinencia", "postparto", "menopausia"],
    keywords: ["incontinencia", "perdidas de orina", "tena", "postparto", "menopausia"],
    audienceTags: ["mujeres", "edad_madura"],
    priority: 7,
    priceRange: "25.000 — 45.000 COP",
  },
  {
    brand: "procaps",
    slug: "omega-3-sexual-health",
    title: "Omega 3 Sexual Health",
    shortDescription:
      "Suplemento de omega 3 con foco en salud sexual — circulación, energía y bienestar general.",
    longDescription: [
      "Omega 3 contribuye a la circulación, los niveles hormonales y la energía — todo conectado con la libido y la respuesta sexual.",
      "Suplemento, no medicación. Habla con tu médica antes de empezar cualquier suplemento si tomas otros tratamientos.",
    ],
    contexts: ["baja_libido", "omega3_libido", "menopausia", "salud_general"],
    keywords: ["omega 3", "libido", "suplemento", "procaps", "salud sexual"],
    audienceTags: ["todos", "edad_madura"],
    priority: 6,
    priceRange: "60.000 — 90.000 COP",
  },
  {
    brand: "dislicores_global_wines",
    slug: "seleccion-vinos-plan-romantico",
    title: "Selección Vinos Plan Romántico",
    shortDescription:
      "Selección curada de vinos pensados para una cena íntima en pareja. Sin pretensiones, con buen gusto.",
    longDescription: [
      "El plan romántico empieza antes de la cama. Una buena cena, una buena conversación, un buen vino — la sensualidad se construye en lo cotidiano.",
      "Selección variada para distintos gustos y presupuestos.",
    ],
    contexts: ["plan_romantico", "vinos", "cita_pareja"],
    keywords: ["vino", "cena", "plan romantico", "cita", "pareja", "dislicores", "global wines"],
    audienceTags: ["parejas", "todos"],
    priority: 5,
    priceRange: "80.000 — 250.000 COP",
  },
  {
    brand: "copas_menstruales",
    slug: "saalt-soft",
    title: "Saalt Soft",
    shortDescription:
      "Copa menstrual de silicona médica suave. Sostenible, cómoda, y diseñada para anatomías sensibles.",
    longDescription: [
      "Una copa menstrual reemplaza años de tampones y toallas. La versión Soft es ideal para quien recién empieza o tiene cuello uterino bajo.",
      "Reutilizable, hipoalergénica, fácil de limpiar.",
    ],
    contexts: ["copa_menstrual", "ciclo_menstrual", "sostenibilidad"],
    keywords: ["copa menstrual", "regla", "ciclo", "saalt", "sostenible", "menstruacion"],
    audienceTags: ["mujeres", "adolescentes", "todos"],
    priority: 6,
    priceRange: "85.000 — 120.000 COP",
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

function validateProduct(product: SeedProduct, index: number) {
  if (!AFFILIATE_BRANDS.includes(product.brand)) {
    throw new Error(`Product #${index} (${product.slug}): unknown brand "${product.brand}"`);
  }
  for (const ctx of product.contexts) {
    if (!AFFILIATE_CONTEXT_TAGS.includes(ctx)) {
      throw new Error(`Product #${index} (${product.slug}): unknown context "${ctx}"`);
    }
  }
  for (const audience of product.audienceTags) {
    if (!(LIBRARY_AUDIENCES as readonly string[]).includes(audience)) {
      throw new Error(
        `Product #${index} (${product.slug}): unknown audience "${audience}"`,
      );
    }
  }
  if (product.shortDescription.length > 200) {
    throw new Error(
      `Product #${index} (${product.slug}): shortDescription exceeds 200 chars`,
    );
  }
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

  PRODUCTS.forEach(validateProduct);

  const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });

  console.log(
    `Seeding ${PRODUCTS.length} affiliate products to ${projectId}/${dataset}...`,
  );
  console.log("All seeded with isActive=false and no affiliateUrl.");

  const seenIds = new Set<string>();
  for (const product of PRODUCTS) {
    const _id = `product-${product.brand}-${product.slug}`;
    if (seenIds.has(_id)) {
      throw new Error(`Duplicate _id "${_id}". Fix the seed list.`);
    }
    seenIds.add(_id);

    const doc = {
      _id,
      _type: "affiliateProduct",
      title: product.title,
      slug: { _type: "slug", current: product.slug },
      brand: product.brand,
      brandDisplayName: BRAND_DISPLAY_NAMES[product.brand],
      shortDescription: product.shortDescription,
      longDescription: paragraphsToPortableText(product.longDescription),
      contexts: product.contexts,
      keywords: product.keywords,
      audienceTags: product.audienceTags,
      priority: product.priority,
      isActive: false,
      ...(product.priceRange ? { priceRange: product.priceRange } : {}),
      lastUpdated: new Date().toISOString(),
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${product.brand}/${product.slug}`);
  }

  console.log("Done.");
  console.log("Next steps in Sanity Studio:");
  console.log("  1. Upload product images.");
  console.log("  2. Paste affiliate URLs once Flavia sends them.");
  console.log("  3. Flip isActive to true per product as Flavia approves each.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
