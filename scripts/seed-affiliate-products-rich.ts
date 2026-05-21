/**
 * Seed script — enriquece los 8 productos afiliados existentes con
 * contexts y keywords ricas para que el motor de recomendaciones
 * tenga catálogo trabajable mientras esperamos que Flavia rellene
 * el Excel con sus contextos reales.
 *
 * Idempotente: usa createOrReplace con los mismos deterministic IDs
 * del seed original.
 *
 * Run:
 *   npx tsx scripts/seed-affiliate-products-rich.ts
 *
 * Despues vuelve a correr el test:
 *   npx tsx scripts/test-affiliate-recommendations.ts
 */

import { config } from 'dotenv';
config({ path: '.env.local', override: true });

import { createClient } from '@sanity/client';

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION ?? '2024-01-01';
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error('Missing required env: SANITY_PROJECT_ID / SANITY_DATASET / SANITY_WRITE_TOKEN');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

/**
 * IMPORTANT: las keywords coinciden con el vocabulario REAL que usan
 * las usuarias en el chat, no terminologia clinica. Cada keyword esta
 * pensada como substring case-insensitive que tiene que aparecer en
 * el mensaje de la usuaria o en los tags extraidos por Haiku.
 *
 * Los contexts son los slugs canonicos de AFFILIATE_CONTEXT_TAGS.
 */

type ProductSeed = {
  _id: string;
  brand: string;
  brandDisplayName: string;
  title: string;
  slug: string;
  shortDescription: string;
  priceRange: string;
  contexts: string[];
  keywords: string[];
  audienceTags: string[];
  priority: number;
};

const products: ProductSeed[] = [
  // ============================================================
  // LELO — Sona 2 Cruise
  // ============================================================
  {
    _id: 'product-lelo-sona-2-cruise',
    brand: 'lelo',
    brandDisplayName: 'LELO',
    title: 'Sona 2 Cruise',
    slug: 'sona-2-cruise',
    shortDescription: 'Estimulador clitoriano con ondas sonicas. Diseno elegante, recargable, ideal para explorar tu placer.',
    priceRange: '450.000 - 600.000 COP',
    contexts: ['juguetes_pareja', 'primera_vez', 'placer_femenino', 'exploracion'],
    keywords: [
      'juguete', 'juguetes', 'vibrador', 'vibradores',
      'estimulador', 'estimulacion clitoriana', 'clitoris',
      'primera vez con juguete', 'primer juguete', 'primer vibrador',
      'no llego al orgasmo', 'nunca he tenido orgasmo', 'no tengo orgasmos',
      'orgasmo con mi pareja', 'llegar al orgasmo',
      'meter un vibrador', 'usar un vibrador',
      'comprar un juguete', 'recomendar juguete',
      'explorar mi cuerpo', 'explorar mi placer', 'explorar mi placer femenino',
      'sona', 'lelo',
    ],
    audienceTags: ['adults_women', 'adults_couples'],
    priority: 7,
  },

  // ============================================================
  // PLATANOMELON — Kit Iniciacion
  // ============================================================
  {
    _id: 'product-platanomelon-kit-iniciacion',
    brand: 'platanomelon',
    brandDisplayName: 'Platanomelon',
    title: 'Kit Iniciacion Pareja',
    slug: 'kit-iniciacion',
    shortDescription: 'Kit pensado para parejas que se inician en los juguetes. Incluye vibrador basico, lubricante y guia.',
    priceRange: '180.000 - 250.000 COP',
    contexts: ['primera_vez', 'juguetes_pareja', 'exploracion', 'curiosidad'],
    keywords: [
      'kit', 'kit de juguetes', 'kit pareja', 'kit iniciacion',
      'soy nueva en esto', 'soy nuevo en esto',
      'no se nada de juguetes', 'no se por donde empezar',
      'primera vez', 'principiante', 'principiantes',
      'empezar a explorar', 'explorar cosas nuevas',
      'cosas nuevas en la cama', 'algo nuevo en la cama',
      'curiosidad', 'tengo curiosidad', 'curiosidad por probar',
      'sin gastar mucho', 'algo barato', 'asequible',
      'experimentar', 'experimentar en pareja',
      'reactivar', 'reactivar la pareja', 'reactivar la cama',
      'platanomelon',
    ],
    audienceTags: ['adults_couples', 'adults_women', 'adults_men'],
    priority: 6,
  },

  // ============================================================
  // GLEEDEN — App de citas
  // ============================================================
  {
    _id: 'product-gleeden-app-gleeden',
    brand: 'gleeden',
    brandDisplayName: 'Gleeden',
    title: 'Gleeden — App de encuentros',
    slug: 'app-gleeden',
    shortDescription: 'App discreta para personas en relaciones que buscan encuentros consensuados o explorar relaciones abiertas.',
    priceRange: 'Suscripcion desde 50.000 COP/mes',
    contexts: ['app_citas', 'infidelidad_consensuada', 'curiosidad'],
    keywords: [
      'relacion abierta', 'relaciones abiertas', 'abrir la relacion', 'abrimos la relacion',
      'pareja abierta', 'matrimonio abierto',
      'poliamor', 'poliamoroso', 'poliamorosa',
      'app de citas', 'aplicacion de citas',
      'conocer gente', 'conocer gente fuera', 'conocer otras personas',
      'gente con pareja', 'personas con pareja',
      'casada pero', 'casado pero',
      'acuerdo de relacion abierta', 'pactamos abrir',
      'explorar fuera de la pareja', 'explorar con otros',
      'discreta', 'discreto',
      'gleeden',
    ],
    audienceTags: ['adults_couples', 'adults_women', 'adults_men'],
    priority: 5,
  },

  // ============================================================
  // GINOCANESTEN — Crema vaginal
  // ============================================================
  {
    _id: 'product-ginocanesten-crema-vaginal',
    brand: 'ginocanesten',
    brandDisplayName: 'Ginocanesten',
    title: 'Crema vaginal hidratante',
    slug: 'crema-vaginal',
    shortDescription: 'Hidratante vaginal para sequedad. Alivia molestias en menopausia, postparto o tras tratamientos hormonales.',
    priceRange: '60.000 - 90.000 COP',
    contexts: ['sequedad_vaginal', 'menopausia', 'salud_intima_femenina', 'postparto'],
    keywords: [
      'sequedad', 'sequedad vaginal', 'seca', 'seco ahi abajo',
      'me arde', 'arde cuando tengo sexo', 'arde durante el sexo',
      'no lubrico', 'no lubrico como antes', 'falta de lubricacion',
      'menopausia', 'en menopausia', 'desde la menopausia',
      'climaterio', 'perimenopausia',
      'molesta la penetracion', 'molesta el sexo',
      'siento dolor en el sexo', 'duele el sexo', 'sexo doloroso',
      'me siento seca', 'siento seca',
      'crema vaginal', 'hidratante vaginal',
      'postparto', 'despues del parto', 'tras el parto',
      'tratamiento hormonal', 'cambios hormonales',
      'salud intima', 'salud intima femenina',
      'ginocanesten', 'canesten',
    ],
    audienceTags: ['adults_women'],
    priority: 8,
  },

  // ============================================================
  // TENA — Discreet pads (incontinencia)
  // ============================================================
  {
    _id: 'product-tena-discreet-pads',
    brand: 'tena',
    brandDisplayName: 'TENA',
    title: 'TENA Discreet',
    slug: 'discreet-pads',
    shortDescription: 'Compresas finas y discretas para pequenas perdidas de orina. Diseno comodo, no se notan.',
    priceRange: '30.000 - 50.000 COP',
    contexts: ['incontinencia', 'postparto', 'menopausia'],
    keywords: [
      'se me escapa', 'se me escapa orina', 'se me escapan unas gotas',
      'perdidas de orina', 'perdidas leves', 'escapes de orina',
      'incontinencia', 'incontinencia urinaria',
      'pierdo gotas', 'pierdo orina',
      'se me sale al reir', 'se me sale al toser', 'se me sale al estornudar',
      'escapes al reir', 'escapes al estornudar',
      'al hacer ejercicio', 'cuando hago ejercicio', 'escapes en el ejercicio',
      'postparto', 'desde el parto', 'despues del parto',
      'suelo pelvico', 'suelo pelvico debil',
      'compresas', 'compresas discretas',
      'tena',
    ],
    audienceTags: ['adults_women'],
    priority: 7,
  },

  // ============================================================
  // PROCAPS — Omega 3 Sexual Health
  // ============================================================
  {
    _id: 'product-procaps-omega-3-sexual-health',
    brand: 'procaps',
    brandDisplayName: 'Procaps',
    title: 'Omega 3 para Salud Sexual',
    slug: 'omega-3-sexual-health',
    shortDescription: 'Suplemento de omega 3 que mejora circulacion, lubricacion y libido general. Apoyo para bajadas de deseo.',
    priceRange: '70.000 - 120.000 COP',
    contexts: ['baja_libido', 'omega3_libido', 'menopausia', 'salud_general'],
    keywords: [
      'bajo deseo', 'sin deseo', 'no tengo deseo', 'no tengo ganas',
      'libido baja', 'libido por el piso', 'mi libido esta baja',
      'no tengo ganas como antes', 'no tengo ganas de nada',
      'apagada', 'me siento apagada', 'me siento sin chispa',
      'sin energia', 'sin energia para el sexo', 'sin energia para todo',
      'sin chispa', 'sin chispa para el sexo',
      'me siento sin', 'me siento baja',
      'menopausia y deseo', 'menopausia y libido',
      'omega 3', 'omega-3', 'omega tres',
      'suplemento para el deseo', 'suplemento libido',
      'circulacion', 'circulacion sanguinea',
      'procaps',
    ],
    audienceTags: ['adults_women', 'adults_men'],
    priority: 6,
  },

  // ============================================================
  // DISLICORES — Seleccion Vinos
  // ============================================================
  {
    _id: 'product-dislicores_global_wines-seleccion-vinos-plan-romantico',
    brand: 'dislicores_global_wines',
    brandDisplayName: 'Dislicores y Global Wines',
    title: 'Seleccion Plan Romantico',
    slug: 'seleccion-vinos-plan-romantico',
    shortDescription: 'Curaduria de vinos pensados para una noche intima. Tintos suaves y burbujas para cenas en pareja.',
    priceRange: 'Desde 80.000 COP por botella',
    contexts: ['plan_romantico', 'vinos', 'cita_pareja'],
    keywords: [
      'vino', 'vinos', 'una botella de vino',
      'cena romantica', 'cena en casa', 'cena especial',
      'noche romantica', 'noche especial',
      'cita romantica', 'cita en pareja', 'cita en casa',
      'aniversario', 'cumplimos aniversario', 'nuestro aniversario',
      'sorprender a mi pareja', 'sorprender en pareja',
      'planeando una cena', 'planeo una cena',
      'preparar algo bonito', 'algo bonito en casa',
      'celebrar', 'celebrar en pareja', 'celebrar juntos',
      'plan romantico', 'plan en pareja', 'noche con mi pareja',
      'reactivar la chispa', 'reactivar la pareja',
      'dislicores', 'global wines',
    ],
    audienceTags: ['adults_couples'],
    priority: 6,
  },

  // ============================================================
  // COPAS MENSTRUALES — Saalt Soft
  // ============================================================
  {
    _id: 'product-copas_menstruales-saalt-soft',
    brand: 'copas_menstruales',
    brandDisplayName: 'Copas menstruales',
    title: 'Saalt Soft',
    slug: 'saalt-soft',
    shortDescription: 'Copa menstrual de silicona medica. Suave, reutilizable, dura hasta 12 horas. Alternativa sostenible.',
    priceRange: '120.000 - 180.000 COP',
    contexts: ['copa_menstrual', 'ciclo_menstrual', 'sostenibilidad'],
    keywords: [
      'copa menstrual', 'copas menstruales', 'copa',
      'regla', 'mi regla', 'menstruacion',
      'periodo', 'mi periodo',
      'tampones', 'dejar los tampones', 'odio los tampones',
      'toallas', 'toallas sanitarias', 'odio las toallas', 'toallas higienicas',
      'sangrado abundante', 'regla abundante', 'menstruacion abundante',
      'sangro mucho', 'sangro muchisimo',
      'sostenible', 'sostenibilidad', 'mas sostenible',
      'reducir basura', 'reducir residuos', 'menos basura',
      'reutilizable', 'opcion ecologica', 'ecologico',
      'toallas de tela', 'alternativa a tampones',
      'saalt', 'organicup',
    ],
    audienceTags: ['adults_women', 'teen_women'],
    priority: 5,
  },
];

async function seed() {
  console.log(`Updating ${products.length} affiliate products with rich keywords...`);
  console.log(`Project: ${projectId}/${dataset}`);
  console.log('');

  let success = 0;
  let failed = 0;

  for (const product of products) {
    try {
      await client.createOrReplace({
        _id: product._id,
        _type: 'affiliateProduct',
        title: product.title,
        slug: { _type: 'slug', current: product.slug },
        brand: product.brand,
        brandDisplayName: product.brandDisplayName,
        shortDescription: product.shortDescription,
        priceRange: product.priceRange,
        contexts: product.contexts,
        keywords: product.keywords,
        audienceTags: product.audienceTags,
        priority: product.priority,
        isActive: true,
        affiliateUrl: 'https://example.com',
        lastUpdated: new Date().toISOString(),
      });
      console.log(`  ✓ ${product.brand}/${product.slug} (${product.keywords.length} keywords, ${product.contexts.length} contexts)`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${product.brand}/${product.slug}: ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log('');
  console.log(`Done. Success: ${success}, Failed: ${failed}.`);
  console.log('');
  console.log('IMPORTANT:');
  console.log('  - All 8 products are now isActive=true with affiliateUrl=https://example.com');
  console.log('  - These are placeholder values until Flavia returns the Excel');
  console.log('  - Run the test again: npx tsx scripts/test-affiliate-recommendations.ts');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
