/**
 * Seed Plus library articles — extracted/synthesized from "Sexo sin Misterios"
 *
 * 5 premium articles (isPremium: true). Each maps to a chapter of the book.
 *
 * Usage:
 *   1. Make sure SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION are set
 *      in .env.local (already present).
 *   2. Add a write token to .env.local:
 *        SANITY_WRITE_TOKEN=your_token_with_editor_or_higher
 *   3. Run:
 *        npx tsx scripts/seed-library-articles-plus.ts
 *
 * Idempotent: deterministic _id (`article-plus-<slug>`) + createOrReplace.
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

const EDITORIAL_SOURCE_BOOK = "Basado en \"Sexo sin Misterios\" de Flavia Dos Santos";

const ARTICLES: SeedArticle[] = [
  {
    slug: "que-es-sexo-normal",
    title: "¿Qué es sexo normal? Spoiler: no existe",
    excerpt:
      "Lo saludable no se define por lo que hace la mayoría — se define por cómo se mira al otro. Una invitación a desmontar la idea heredada de \"normalidad\" sexual.",
    body: [
      "Cada vez que alguien me pregunta \"¿esto que hago es normal?\" mi primera respuesta es siempre la misma: ¿quién decide qué es normal en sexo?",
      "Lo saludable se define por algo distinto a lo común. Se define por cómo se mira al otro en ese momento íntimo. Si hay comunicación, si hay placer mutuo, si hay respeto — eso es lo que importa. Las prácticas varían de cultura a cultura, de época a época, de contexto a contexto. Lo que era escandaloso hace cincuenta años hoy es cotidiano. Lo que en un país es tabú en otro es celebración.",
      "La normalidad sexual no es una verdad universal. Es un acuerdo cultural que cambia.",
      "En el \"perverso\" — y ahí pongo la palabra entre comillas porque también es cultural — no se mira al otro. No hay comunicación. La otra persona se utiliza, se destruye, se instrumentaliza. Esa es la línea. No la práctica en sí, sino la mirada hacia quien está contigo.",
      "Hay personas que viven con culpa toda la vida por haber sentido un deseo que no encaja en lo que les dijeron que era normal. Por haber tenido una fantasía. Por haber probado algo y haberlo disfrutado. Y esa culpa es heredada — no es tuya. Es de la cultura que te crió, de la educación que recibiste, de los miedos que otros te transmitieron.",
      "Tu trabajo, si quieres tener una vida sexual plena, es ir desmontando esas culpas heredadas. No para hacer todo lo que se te ocurra — sino para distinguir lo que es tuyo de lo que es prestado.",
      "Pregúntate: ¿esto me hace daño? ¿Le hace daño a otra persona? ¿Hay consentimiento? ¿Hay respeto? Si las respuestas son no, no, sí y sí — estás bien. Lo que sientas, lo que desees, lo que explores, mientras cumpla con eso, no necesita más permiso que el tuyo.",
      "Lo que sí sigue siendo problema es cuando el deseo destruye al otro. Cuando se ejerce poder. Cuando no hay capacidad de decisión. Cuando alguien está siendo usado. Esa es la línea real, y es bastante simple cuando dejas de buscar reglas externas y empiezas a mirar la dinámica concreta.",
      "Y para los adolescentes — porque siempre llegan estas preguntas — la única respuesta es: a tiempo, con información, con responsabilidad. No hay una edad correcta para empezar. Hay un momento correcto para cada quien. Y \"ese momento\" significa entender qué pasa, querer hacerlo, y estar con alguien que respete eso.",
      "Cada persona tiene el poder de crear su propia normalidad. Esa es la única libertad sexual real.",
    ],
    topicTags: ["education", "self_connection"],
    intentTags: ["understanding", "reflection"],
    sectionTag: "soy_normal_o_distinto",
    audienceTags: ["todos"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-04-30T10:00:00.000Z",
  },
  {
    slug: "porque-no-tienes-orgasmo-y-que-hacer",
    title: "Por qué no tienes orgasmo (y qué hacer al respecto)",
    excerpt:
      "La anorgasmia femenina casi nunca es un problema físico. Tres mitos que hay que tumbar antes de pensar que algo está roto, y un mapa concreto para empezar.",
    body: [
      "La anorgasmia femenina — la dificultad o imposibilidad para llegar al orgasmo — es una de las consultas más frecuentes que recibo. Y casi siempre, antes de que termine de explicarme la situación, ya sé que el problema no es físico.",
      "La gran mayoría de los casos son psicológicos. Tensión. Ansiedad. Falta de información sobre el propio cuerpo. Educación sexual hecha de mitos y miedos. Una idea heredada de que disfrutar es egoísta o sucio. Y muchas veces, la presión por tener un orgasmo — porque la pareja lo espera, porque \"se supone\" — es exactamente lo que lo bloquea.",
      "El primer mito que hay que tumbar: no existen dos tipos de orgasmo independientes. Lo que llamamos orgasmo \"vaginal\" y orgasmo \"clitoriano\" son parte del mismo sistema. El clítoris es un órgano grande del que solo vemos la punta — sus terminaciones nerviosas se extienden hacia adentro, hasta la pared vaginal. El llamado \"punto G\" es parte de esa estructura, no una zona separada.",
      "Esto importa porque mucha mujer se siente \"menos\" por no tener orgasmos durante la penetración. Y la realidad es que solo un porcentaje pequeño de mujeres llega al orgasmo solo con penetración. La mayoría necesita estimulación clitoriana directa o complementaria. No estás rota — la información que te dieron está incompleta.",
      "Segundo mito: el orgasmo es el objetivo del sexo. No lo es. Es el postre, no el plato fuerte. El sexo son las sensaciones, el toque, la conexión, la intimidad. Si conviertes el orgasmo en obligación, en meta a alcanzar, en demostración de que el sexo \"funcionó\" — la cabeza entra en modo evaluación y el cuerpo se cierra. La presión es enemiga del placer.",
      "Tercer mito: si nunca lo has tenido, algo está mal contigo. La mayoría de mujeres que vienen a consulta sin haber tenido un orgasmo no tienen ningún problema fisiológico. Tienen falta de información sobre su propio cuerpo. La masturbación consciente — sin prisa, sin objetivo, explorando qué te gusta — es el primer paso. Conocer tu cuerpo a fondo antes de pedirle a otra persona que lo conozca por ti.",
      "¿Qué hacer entonces?",
      "Empezar por ti. Tiempo a solas, sin juicio, sin expectativa. Probar diferentes formas de estimulación. Notar qué te excita, qué te bloquea. Es información que solo tú puedes generar. Nadie va a leerte la mente — ni siquiera tu pareja, por más que te ame.",
      "Después, comunicar. Decirle a la pareja qué te gusta, qué no, qué quisieras explorar. La comunicación sexual es una habilidad, y como toda habilidad se aprende. La buena noticia: cada conversación honesta sobre sexo aumenta la intimidad mucho más que cualquier técnica.",
      "Y si después de explorar y comunicar sigues sin tener orgasmos, busca terapia sexual. No porque haya algo mal en ti — sino porque a veces necesitamos a alguien que nos ayude a desarmar bloqueos que nosotras solas no vemos. Es trabajo, sí. Pero el placer es un derecho, y vale la pena trabajar por él.",
      "Una última cosa: hay mujeres que no buscan orgasmo y disfrutan profundamente del sexo. Eso también es válido. El orgasmo no es la meta de todas. Lo que importa es que tú decidas qué es buen sexo para ti — no que cumplas un libreto que alguien más escribió.",
    ],
    topicTags: ["pleasure", "body_confidence", "self_connection"],
    intentTags: ["understanding", "practical_ideas"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["mujeres"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-04-30T10:05:00.000Z",
  },
  {
    slug: "eyaculacion-precoz-lo-que-todos-sienten",
    title: "Eyaculación precoz: lo que todos sienten y nadie habla",
    excerpt:
      "Afecta a 1 de cada 4 hombres en algún momento. Casi siempre el origen es psicológico — y casi siempre se puede trabajar. Distinciones, técnicas y un cambio de enfoque.",
    body: [
      "A los hombres les da una vergüenza inmensa hablar de eyaculación precoz. Es uno de los temas más silenciados en consulta. Llegan diciéndome que tienen \"un problema\", se ruborizan al describirlo, y casi siempre creen que son los únicos.",
      "No lo son. La eyaculación precoz es una de las disfunciones sexuales masculinas más comunes — afecta entre el 20% y el 30% de los hombres en algún momento de su vida. Y en América Latina, las cifras son altas, en parte porque el silencio cultural alrededor del tema impide que se trabaje.",
      "Primero distingamos. Una eyaculación rápida en una primera vez con una pareja nueva no es eyaculación precoz. Tampoco lo es eyacular antes de tiempo en un momento de mucha excitación, después de tiempo sin sexo, o cuando hay alta tensión emocional. Eso es completamente normal. La eyaculación precoz es un patrón recurrente — sucede sistemáticamente, afecta tu vida sexual, genera evitación, y empieza a contaminar la relación con tu propio cuerpo.",
      "¿Por qué pasa? La mayoría de los casos tienen origen psicológico. Ansiedad de desempeño. Miedo al juicio de la pareja. Trauma de experiencias tempranas — muchos hombres aprendieron a masturbarse rápido, en silencio, con miedo a ser descubiertos, y ese aprendizaje se quedó marcado. Y a veces simplemente vivir bajo presión — laboral, familiar, económica — se traduce en el cuerpo como falta de control eyaculatorio.",
      "Hay también un componente fisiológico en algunos casos: hipersensibilidad del glande, niveles de serotonina, factores neurológicos. Por eso vale la pena descartar lo médico. Pero en la mayoría de las consultas, cuando se trabaja el componente psicológico, el problema mejora significativamente.",
      "Algo importante: la eyaculación precoz casi nunca aparece sola. Suele venir acompañada de ansiedad, que a veces se convierte en pérdida de erección. Y se entra en un círculo vicioso — eyaculas pronto, te angustias, la próxima vez la angustia genera tensión, la tensión bloquea la erección o acelera la eyaculación. Es importante trabajar las dos cosas juntas.",
      "Hay otro dato que te puede sorprender: muchos hombres tienen eyaculación precoz con algunas parejas y con otras no. Si eso te pasa, confirma que el componente principal es psicológico. La química con cada persona, el nivel de confianza, la presión que sientes — todo influye. Es información valiosa, no un fallo aleatorio.",
      "¿Qué hacer?",
      "Primero, hablar. Con tu pareja, con un terapeuta sexual, con un médico para descartar lo físico. El silencio es el peor amigo de cualquier disfunción sexual — la hace más grande de lo que es.",
      "Segundo, técnicas concretas que funcionan. La técnica de \"parar y empezar\" (interrumpir la estimulación cuando estás cerca del orgasmo, esperar, retomar). La técnica del apretón (presión firme bajo el glande para reducir la urgencia). Masturbación consciente para aprender a identificar el \"punto sin retorno\" antes de llegar a él. Estas técnicas se aprenden — y funcionan.",
      "Tercero, descentrar el sexo del pene. El sexo no es solo penetración. Si llegas al orgasmo antes de lo que querrías, el encuentro no termina ahí. Hay manos, boca, cuerpo, conexión. Hay otra persona que puede seguir disfrutando contigo. Eyacular no significa terminar — significa cambiar de modo. Y muchas mujeres prefieren ese segundo modo al primero.",
      "La eyaculación precoz no te hace menos hombre. Te hace humano, exactamente como millones de otros que también la tienen y no la hablan. Hablarla es el primer paso para resolverla.",
    ],
    topicTags: ["body_confidence", "couple_connection", "communication"],
    intentTags: ["understanding", "practical_ideas"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["hombres"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-04-30T10:10:00.000Z",
  },
  {
    slug: "sexo-despues-de-los-60",
    title: "El sexo después de los 60: lo que nadie te cuenta",
    excerpt:
      "La idea de que la vida sexual termina con la menopausia o la jubilación es la mentira más cara que cargamos. El cuerpo cambia — pero el placer no caduca.",
    body: [
      "La idea de que la vida sexual termina con la menopausia, con la jubilación, con la tercera edad — es una de las mentiras más extendidas y más dañinas que cargamos. Y como toda mentira repetida, mucha gente la cree. Llegan a los 60 pensando que ya \"tuvieron su tiempo\", que ahora toca renunciar, que el sexo es para los jóvenes.",
      "No es así. Y no debería serlo.",
      "La OMS considera que la tercera edad empieza a los 60, y cada vez se atrasa más esa entrada. La sexualidad activa se ha podido prolongar significativamente — la edad ya no es un factor que impida el placer. Y muchas mujeres, especialmente, descubren después de la menopausia una libertad sexual que no habían tenido antes en su vida. Sin miedo al embarazo. Con los hijos crecidos. Con más conocimiento del propio cuerpo. Con menos pudor.",
      "¿Qué cambia? Cambian los ritmos, los cuerpos, las respuestas. La lubricación natural disminuye en muchas mujeres después de la menopausia — eso se resuelve con lubricantes, sin drama. Las erecciones pueden tardar más, ser menos firmes, depender más del estímulo directo — eso también es manejable, con paciencia y a veces con ayuda médica como sildenafil o similares cuando es apropiado. El deseo puede ser distinto — más contextual, menos urgente, más vinculado a la cercanía emocional.",
      "Cambia, sí. Pero no termina.",
      "Lo que más mata la sexualidad en la tercera edad no es el cuerpo — es la mente. La idea heredada de que es \"ridículo\" o \"inapropiado\" que dos personas mayores tengan sexo. La burla social hacia la sexualidad de los abuelos. El sentimiento de que ya no eres deseable. La renuncia silenciosa que se instala en muchas parejas — \"ya para qué\".",
      "A esa renuncia hay que ponerle palabras. Si tú y tu pareja deciden, conscientemente, que el sexo ya no es parte de su vida, eso es respetable. Pero hablarlo, no asumirlo. Porque en muchísimos casos lo que pasa es que uno de los dos asume que el otro ya no quiere y deja de proponerlo, mientras el otro asume lo mismo y deja de buscarlo. Y se quedan los dos sin sexo, los dos creyendo que el otro lo decidió, los dos perdiendo algo que ambos querían.",
      "La conversación es siempre el primer paso. Después viene el resto.",
      "Sobre las pastillas y suplementos: el sildenafil — la pastilla que conocemos como Viagra — y sus equivalentes han cambiado dramáticamente la sexualidad masculina en la tercera edad. No es trampa, no es debilidad — es una herramienta. Si te ayuda a tener una vida sexual activa, úsala con la asesoría de un médico. Lo mismo aplica para tratamientos hormonales cuando son apropiados, lubricantes vaginales, cremas de estrógeno local, terapia de suelo pélvico.",
      "Y sobre la falta de deseo: no se medica de entrada. La falta de deseo en la tercera edad casi siempre tiene un contexto. Cansancio acumulado de años. Distancia emocional con la pareja. Cambios hormonales. Rutina. Todas esas cosas se trabajan por capas — primero el contexto, luego la pareja, luego el cuerpo. Las pastillas son la última opción, no la primera.",
      "Una última cosa que veo mucho en consulta: hombres mayores que se emparejan con mujeres mucho más jóvenes, y mujeres mayores que se emparejan con hombres más jóvenes. Cada caso es distinto. Algunos buscan recuperar juventud — y eso, si es lo único, suele terminar mal. Otros simplemente conectaron con alguien de otra edad por afinidad real — y eso puede funcionar perfectamente. La pregunta no es la edad. La pregunta es qué busca cada uno y si están allí desde el deseo o desde la necesidad.",
      "La sexualidad en la tercera edad es posible, deseable y saludable. De hecho, los estudios muestran que las personas mayores con vida sexual activa tienen mejor salud cardiovascular, mejor estado de ánimo y mayor expectativa de vida. El placer es protector — siempre lo ha sido.",
      "No te creas que ya tuviste tu tiempo. El tiempo es ahora.",
    ],
    topicTags: ["menopause", "desire", "self_connection"],
    intentTags: ["understanding", "reconnection"],
    // emocional_mente in the source file maps to the canonical section "emocionalmente"
    sectionTag: "emocionalmente",
    audienceTags: ["edad_madura"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-04-30T10:15:00.000Z",
  },
  {
    slug: "homosexualidad-nacer-hacerse-o-ser",
    title: "Homosexualidad: nacer, hacerse, o simplemente ser",
    excerpt:
      "La pregunta importante no es si uno nace o se hace — es por qué necesitamos que sea de una manera específica para aceptarlo. La validez no depende del origen.",
    body: [
      "La pregunta que más recibo de personas que están explorando su orientación sexual no es \"¿soy gay?\" — es \"¿es esto un problema?\". Y la pregunta detrás de la pregunta es: \"¿hay algo malo en mí?\".",
      "No.",
      "Empiezo por ahí porque todo lo demás importa menos. La orientación sexual — sea heterosexual, homosexual, bisexual, asexual, lo que sea — no es un problema en sí misma. El problema es la cultura que enseña a algunas personas a sentir vergüenza de su deseo, mientras valida sin condiciones el deseo de otras.",
      "¿Un homosexual nace o se hace? La ciencia hoy acepta que la orientación sexual tiene componentes biológicos, hormonales, de desarrollo temprano. Hay evidencia de factores genéticos, evidencia de influencias hormonales prenatales, evidencia de que la orientación se establece muy temprano en la vida y no se elige. Pero más allá del debate científico, hay una pregunta más interesante: ¿por qué necesitamos que sea de una manera específica para aceptarla?",
      "Si fuera 100% biológica — sería válida.\nSi fuera 100% experiencial — sería válida.\nSi fuera una mezcla — sería válida.",
      "La validez no depende del origen.",
      "¿Una experiencia con alguien del mismo sexo te hace homosexual? No. La curiosidad, la experimentación, las experiencias puntuales son parte de la sexualidad humana. Muchas personas heterosexuales tuvieron experiencias homosexuales en su vida y siguen identificándose como heterosexuales. Muchas personas que se sentían heterosexuales descubrieron en algún momento que su deseo iba en otra dirección. La orientación no se define por una experiencia — se define por dónde está tu deseo de forma sostenida.",
      "Probar no etiqueta. La etiqueta la pones tú cuando reconoces tu propio mapa. Y a veces ni siquiera necesitas ponerla.",
      "Una cosa que me pasa mucho en consulta: personas que llegan asustadas porque tuvieron una fantasía homosexual o se excitaron viendo cierto tipo de pornografía o sintieron atracción puntual por alguien del mismo sexo. Vienen con el mismo guión de culpa. Y mi primera pregunta es siempre la misma: ¿qué tendría de malo si fuera así?",
      "Si la respuesta es \"es que no sé cómo decirlo en mi familia\" o \"qué van a pensar en mi trabajo\" — entonces el problema no es la orientación, es el contexto. Y eso es algo distinto, que se trabaja por separado.",
      "Si la respuesta es \"está mal según mi religión\" — entiendo. Pero también sé que muchas personas reconcilian su fe con su orientación, que existen comunidades religiosas que acompañan, y que la culpa religiosa no resuelve el deseo, solo lo entierra.",
      "Si la respuesta es \"es que me da miedo lo desconocido\" — perfecto, vamos por ahí. El miedo a lo desconocido es legítimo. Pero el desconocido eres tú mismo en una versión que no habías explorado. Y conocerte es siempre buena idea.",
      "Si pregonamos libertad sexual, ¿por qué sigue habiendo tanta represión hacia la homosexualidad? Porque la libertad de la que se habla muchas veces es selectiva. Aceptamos la diversidad mientras no nos toque de cerca. La represión viene del miedo a lo distinto, de creencias heredadas, de un patriarcado que necesita roles fijos para sostenerse. El trabajo es de todos — no solo de las personas LGBT+.",
      "Lo que importa, al final, es esto: tu orientación es información sobre ti. No es defecto, no es problema, no es enfermedad — es información. Cuando la reconoces sin pelearte con ella, puedes vivirla. Cuando la reconoces y la peleas, te haces daño. Y cuando la niegas, el cuerpo termina hablando por otros lados — ansiedad, depresión, relaciones que no funcionan.",
      "La salud mental y la orientación sexual están conectadas. Vivir tu orientación con tranquilidad es parte de tu bienestar general — sea cual sea esa orientación.",
      "Y si estás explorando — date tiempo. No tienes que tener una respuesta hoy. La sexualidad es un proceso, no un examen.",
    ],
    topicTags: ["identity", "self_connection", "curiosity"],
    intentTags: ["understanding", "reflection"],
    sectionTag: "tengo_miedo",
    audienceTags: ["todos"],
    isPremium: true,
    editorialSource: EDITORIAL_SOURCE_BOOK,
    publishedAt: "2026-04-30T10:20:00.000Z",
  },
];

function deterministicId(slug: string): string {
  return `article-plus-${slug}`;
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

  console.log(`Seeding ${ARTICLES.length} Plus articles to ${projectId}/${dataset}...`);

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
