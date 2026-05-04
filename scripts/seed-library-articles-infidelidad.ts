/**
 * Seed Plus library articles — extracted/synthesized from "Infidelidad"
 *
 * 4 premium articles (isPremium: true). Each maps to one or more chapters
 * of the book.
 *
 * Usage:
 *   1. Make sure SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION are set
 *      in .env.local.
 *   2. Add a write token to .env.local:
 *        SANITY_WRITE_TOKEN=your_token_with_editor_or_higher
 *   3. Run:
 *        npx tsx scripts/seed-library-articles-infidelidad.ts
 *
 * Idempotent: deterministic _id (`article-infidelidad-<slug>`) + createOrReplace.
 * Distinct from `article-plus-<slug>` (Sexo sin Misterios) so the two
 * sources never collide on _id.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@sanity/client";

import {
  type LibraryAudience,
  type LibrarySection,
  type LibraryTopicTag,
} from "@/features/library/constants";

type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  topicTags: LibraryTopicTag[];
  intentTags: string[];
  sectionTag: LibrarySection;
  audienceTags: LibraryAudience[];
  isPremium: boolean;
  editorialSource: string;
  publishedAt: string;
};

const EDITORIAL_SOURCE_BOOK = "Basado en \"Infidelidad\" de Flavia Dos Santos";

const ARTICLES: SeedArticle[] = [
  {
    slug: "la-cultura-de-la-infidelidad",
    title: "La cultura de la infidelidad",
    excerpt:
      "La fidelidad sexual exclusiva no está inscrita en la biología — es un acuerdo cultural. Lo universal no es la fidelidad, es la lealtad.",
    body: [
      "Si hay un tema universal, es la infidelidad. Aparece en todas las culturas, todas las religiones, todos los siglos. Y sin embargo seguimos hablando de ella como si fuera una excepción, una desviación, algo que les pasa a \"otros\".",
      "No es así.",
      "La infidelidad es uno de los comportamientos humanos más documentados de la historia. Está en la Biblia, en el Corán, en los mitos griegos, en las novelas de cada siglo. Y la pregunta que nadie quiere hacer en voz alta es: si es tan común, ¿por qué la tratamos como una anomalía?",
      "Porque toda sociedad necesita reglas para funcionar, y la fidelidad sexual es una de las reglas que más sostienen el contrato social tradicional. La idea de pareja monógama y exclusiva no es natural — es cultural. Funcional, sí. Sostenible para criar familias, sí. Pero no inscrita en nuestra biología de forma absoluta.",
      "Lo que define realmente la infidelidad cambia según la cultura. En algunas sociedades antiguas, los hombres podían tener varias esposas sin que se considerara infidelidad — era estatus. En otras, una mujer que mirara directamente a otro hombre ya cometía adulterio. Hoy, en la era digital, hay parejas que consideran infidelidad un like en Instagram, y otras que tienen acuerdos abiertos donde el sexo con terceros no rompe nada.",
      "La pregunta no es entonces \"¿qué es la infidelidad?\" — la pregunta es \"¿qué es infidelidad para nosotros, en esta pareja, en este contrato que hemos hecho juntos?\".",
      "Hay parejas que rompen porque uno chateó dulcemente con alguien. Hay parejas que sobreviven a un encuentro físico de una noche. Hay parejas que pactan acuerdos abiertos. Hay parejas que viven bajo infidelidades crónicas que ambos saben pero nadie nombra. Cada una de esas configuraciones tiene su propia definición de lo que rompe la confianza.",
      "La cultura nos enseña a esperar exclusividad absoluta como prueba de amor. Pero la exclusividad absoluta es una construcción muy reciente en la historia humana, y no necesariamente la mejor. Lo que sí es universal es la necesidad de honestidad — de que dentro de la pareja, las reglas estén claras. No la regla \"fidelidad\", sino \"esto es lo que nosotros pactamos\".",
      "Lo que rompe una pareja casi nunca es el acto en sí. Lo que rompe es la mentira que lo rodea, el doble juego, la traición de la confianza acordada. Por eso una mentira pequeña puede destruir más que una infidelidad consentida. La fidelidad no es un valor absoluto — la lealtad sí lo es.",
      "Y ahí está la frase que más repito en consulta: hay que ser infiel, pero nunca desleal. La infidelidad puede negociarse, conversarse, redefinirse. La deslealtad no.",
    ],
    topicTags: ["couple_connection", "communication", "identity"],
    intentTags: ["understanding", "reflection"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["todos"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-05-01T10:00:00.000Z",
  },
  {
    slug: "infidelidad-y-mujeres",
    title: "La infidelidad y las mujeres — desmontando el doble rasero",
    excerpt:
      "Cuando una mujer es infiel, rompe dos pactos al mismo tiempo: el de su pareja y el cultural sobre cómo \"debe\" ser una mujer. Por eso duele distinto.",
    body: [
      "Cuando una mujer es infiel, la sociedad la juzga distinto que a un hombre. Esa es la realidad que toda mujer carga aunque no quiera. Y entender ese doble rasero es el primer paso para mirar la infidelidad femenina sin las gafas oxidadas que nos pusieron desde niñas.",
      "Hay mucha expectativa sobre la palabra \"mujer\". Todo el mundo tiene fantasías sobre lo que significa ser mujer y la cantidad de compromisos que tiene que hacer en la vida. Y uno de ellos es ser fiel, leal, coherente. Hay muchas historias donde la mujer traiciona y paga un precio altísimo — a veces con la vida.",
      "¿Por qué las mujeres son infieles? Hay muchas razones. La más obvia, la más ridícula, es la venganza: un clavo saca otro clavo. Pero hay razones más complejas. Las mujeres tienen falta de sexo o falta de amor dentro de la relación de pareja. Cuando la relación empieza a perder color, cuando ya no hay tiempo para comunicarse, cuando ya no hay energía en la pareja, las mujeres son las primeras en percibirlo. Empiezan a sufrir por esa falta de intimidad y de comunicación. Y esa es muchas veces la primera grieta.",
      "La idea de que la mujer es infiel \"porque es perra\" es un error. Lo que pasa es que no se comprende que las mujeres atraviesan varios cambios emocionales a lo largo de la vida. Y siempre hay una necesidad de alguien que las ame y las apoye.",
      "Tanto los hombres como las mujeres sienten igual cantidad de deseo. Ser \"buena\" no significa no sentir deseo. Pero a lo largo de la historia, el control de la sexualidad femenina ha impuesto sobre las mujeres una duda eterna entre su conducta y su lealtad. Por eso se inventaron los cinturones de castidad, se cortaron los clítoris, se quemaron mujeres en hogueras. La sexualidad femenina, al ser interna, al no ser visual, ha sido percibida siempre como una amenaza castrante para los hombres.",
      "Por eso las mujeres cargan con palabras tan horribles como \"ninfómana\". Hoy todavía las llaman así. Se cree que una mujer que siente más deseo sexual que otra, o más que un hombre, es una ninfómana. Pero la verdad es que muchas mujeres sienten más deseo sexual que el hombre que tienen al lado. Y el sistema no sabe qué hacer con eso, así que las patologiza.",
      "Es muy pesado para las mujeres tener que disimular su deseo y no poder vivirlo. Y esa represión genera presión interna. Cuando esa presión se encuentra con una conexión real fuera de la pareja, la infidelidad puede aparecer no como una traición planificada, sino como un escape emocional.",
      "¿Significa esto que la infidelidad femenina está justificada? No. Significa que tiene contexto. Y que mirar el contexto es mucho más útil que repartir culpas.",
      "Lo que duele de la infidelidad de una mujer no es solo el acto. Es que rompe el pacto silencioso de que las mujeres \"no hacen eso\". Y precisamente por eso, cuando una mujer es infiel, casi siempre es porque algo importante en la pareja ya estaba roto.",
    ],
    topicTags: ["identity", "desire", "couple_connection"],
    intentTags: ["understanding", "reflection"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["mujeres"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-05-01T10:05:00.000Z",
  },
  {
    slug: "infidelidad-masculina",
    title: "Infidelidad masculina — la herencia del patriarcado",
    excerpt:
      "Cuando un hombre adulto es infiel, casi nunca busca placer. Busca reafirmación. La infidelidad masculina es una crisis identitaria disfrazada de aventura.",
    body: [
      "La infidelidad masculina tiene su origen en algo que no se nombra suficiente: el patriarcado. Y entender eso no es un gesto político — es un gesto clínico. Para tratar la infidelidad masculina hay que mirar de dónde viene la idea de que un hombre \"fuerte\" es un hombre con varias mujeres.",
      "Es interesante ver cuántas palabras importantes empiezan con la letra P: padre, patrón, plata, poder, profesor, policía, patriarcado. Las mujeres han estado sometidas a estas palabras desde el momento en que el hombre necesitó vigilar sus territorios y controlar su prole. En el momento en que la plata empieza a considerarse importante, se inventa el patriarcado. Por eso existe la tendencia al machismo: porque los que hacen las reglas mandan.",
      "En términos de infidelidad, los hombres siempre han obtenido más perdón que las mujeres. En los hombres siempre fue bien vista la infidelidad, como algo normal y natural, porque se cree que los hombres tienen más deseo sexual que las mujeres. Vemos casos de hombres en el poder — Mitterrand, Kennedy, tantos más — que pudieron disfrutar de la infidelidad sin mayor culpa. La sociedad los perdona.",
      "Pero esta narrativa tiene un costo invisible para los hombres también.",
      "Los hombres no nacen hombres, se vuelven hombres. De acuerdo con los cánones vigentes, tienen que volverse viriles, fuertes, potentes, erectos, grandes seductores. La hombría se mide en parte por la capacidad de \"tener a varias\". Y eso pone a los hombres en una posición imposible: ser fieles puede sentirse, en algún rincón heredado, como una \"rebaja\" de su masculinidad.",
      "La primera vez que un hombre experimenta el sexo, casi nunca siente placer real — pero al día siguiente, cuando lo cuenta entre amigos, recibe un orgasmo simbólico mucho más grande: el reconocimiento del grupo. Eso marca para siempre la relación entre sexo, validación y masculinidad.",
      "Cuando un hombre adulto es infiel, muchas veces no busca placer sexual. Busca reafirmación. Busca sentirse deseado, verse a sí mismo como joven, demostrarse algo. La infidelidad masculina es muchas veces una crisis identitaria disfrazada de aventura.",
      "Y eso lo hace más triste, no menos serio. Porque significa que detrás del acto hay un hombre que no sabe quién es sin la mirada de otra mujer.",
      "Los hombres infieles que llegan a consulta no llegan porque les pesa haber roto un pacto. Llegan cuando se dan cuenta de que la infidelidad no les llenó nada. Que el placer fue corto. Que lo que querían no era sexo nuevo — era sentirse vivos. Y eso no se compra con una amante.",
      "La salida no es la represión. La salida es trabajar la masculinidad sin patriarcado. Una masculinidad que pueda ser fiel sin sentirse menos. Que pueda envejecer sin tener que demostrar virilidad. Que pueda decir \"esto es lo que pasa por dentro\" sin sentir que pierde poder.",
      "Esa es la verdadera revolución para los hombres. Y muchos están listos para hacerla.",
    ],
    topicTags: ["identity", "couple_connection", "communication"],
    intentTags: ["understanding", "reflection"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["hombres"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-05-01T10:10:00.000Z",
  },
  {
    slug: "reconstruir-pareja-despues-infidelidad",
    title: "Cómo se reconstruye una pareja después de la infidelidad",
    excerpt:
      "Ni el rompimiento inmediato ni el perdón inmediato son buenos consejeros. Las seis condiciones mínimas para que la reconstrucción sea posible.",
    body: [
      "Cuando se descubre una infidelidad, el primer instinto es romper. El segundo instinto es perdonar de inmediato para que el dolor pase. Los dos instintos son trampas. Ni la reacción inmediata ni el perdón inmediato son buenos consejeros.",
      "La reconstrucción de una pareja después de una infidelidad no es un proceso lineal. No tiene fórmula. No tiene calendario. Pero sí hay condiciones mínimas sin las cuales no es posible.",
      "1. Tiene que terminar.",
      "La infidelidad activa, la relación con la otra persona, tiene que terminar antes de empezar cualquier reconstrucción. No \"ir terminando\", no \"ir distanciándose\". Terminar. Sin contacto, sin excepciones. Mientras la tercera persona siga en escena, no hay reconstrucción posible.",
      "2. Tiene que haber una conversación honesta.",
      "No interrogatorio. No detalles morbosos. Una conversación que responda las preguntas que la persona traicionada necesita responder para entender qué pasó. ¿Por cuánto tiempo? ¿Quién es? ¿Era física, emocional, ambas? ¿Por qué? Las respuestas duelen. Pero las medias verdades duelen más a largo plazo, porque cuando aparecen — y aparecen siempre — vuelven a abrir todas las heridas.",
      "3. Tiene que haber un trabajo individual.",
      "La persona infiel tiene que entender por qué fue infiel. No la excusa fácil (\"tomé mucho\", \"estaba en crisis\"). La razón profunda. ¿Qué buscaba? ¿Qué le faltaba? ¿Qué se permitió que no debió? Sin ese trabajo, la infidelidad volverá. Quizás con otra persona, quizás de otra forma, pero volverá. Es un patrón, no un accidente.",
      "4. Tiene que haber un trabajo de pareja.",
      "Algo en la pareja estaba roto antes de la infidelidad. Casi siempre. La infidelidad rara vez aparece en parejas vivas, conectadas, atendidas. Aparece en parejas dormidas. Reconstruir significa entender qué se durmió y por qué. Sin ese trabajo, lo que se reconstruye es una versión más frágil de la pareja anterior.",
      "5. Tiene que haber tiempo.",
      "Recuperar la confianza es lento. Mucho más lento de lo que la persona infiel quisiera. La persona traicionada va a tener crisis, recaídas emocionales, momentos de duda — incluso meses o años después. Eso no es fragilidad, es el proceso. Quien fue infiel tiene que sostener ese proceso con paciencia y sin defensividad.",
      "6. Tiene que haber una decisión consciente, no un quedarse por inercia.",
      "Hay parejas que se quedan juntas después de una infidelidad por miedo a la soledad, por los hijos, por la economía, por costumbre. Esa pareja no se reconstruye — sobrevive. La pregunta honesta que ambos tienen que hacerse es: ¿quiero estar con esta persona después de saber lo que sé? Si la respuesta es sí, hay reconstrucción posible. Si la respuesta es \"no sé pero no puedo irme\", hay convivencia, no reconstrucción.",
      "A veces la pareja que se reconstruye es mucho más fuerte que la anterior. Porque ha pasado por algo grave y ha decidido seguir. Ha mirado lo peor de sí misma y ha decidido cuidarse. Eso pasa, y cuando pasa es hermoso.",
      "Pero la mayoría de veces, la reconstrucción real lleva uno, dos, tres años. Y termina con una pareja distinta. No la misma de antes. Otra. Más adulta, más consciente, más cuidada.",
      "Lo que nunca funciona es fingir que no pasó.",
    ],
    topicTags: ["couple_connection", "communication", "self_connection"],
    intentTags: ["practical_ideas", "reflection"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["todos"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-05-01T10:15:00.000Z",
  },
];

function deterministicId(slug: string): string {
  return `article-infidelidad-${slug}`;
}

function paragraphsToPortableText(paragraphs: string[]) {
  return paragraphs.map((text, index) => ({
    _key: `block-${index}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: `span-${index}`, _type: "span", marks: [], text }],
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

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });

  console.log(`Seeding ${ARTICLES.length} Infidelidad articles to ${projectId}/${dataset}...`);

  for (const article of ARTICLES) {
    if (!article.isPremium) {
      throw new Error(
        `Article ${article.slug} is not marked premium — this script is for Plus content only.`,
      );
    }

    const _id = deterministicId(article.slug);
    const doc = {
      _id,
      _type: "article",
      title: article.title,
      slug: { _type: "slug", current: article.slug },
      excerpt: article.excerpt,
      body: paragraphsToPortableText(article.body),
      topicTags: article.topicTags,
      intentTags: article.intentTags,
      sectionTag: article.sectionTag,
      audienceTags: article.audienceTags,
      contentType: "article",
      isPremium: article.isPremium,
      chatRecommended: false,
      editorialSource: article.editorialSource,
      publishedAt: article.publishedAt,
    };

    await client.createOrReplace(doc);
    console.log(`  ✓ ${article.slug}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
