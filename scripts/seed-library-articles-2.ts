/**
 * Seed library articles — Tanda 2
 *
 * Loads 8 articles from C:/Users/otger/Downloads/flavia_library_articles_tanda2.md
 * (already inlined below) into Sanity as `article` documents.
 *
 * Usage:
 *   1. Make sure SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION are set
 *      in .env.local (already present).
 *   2. Add a write token to .env.local:
 *        SANITY_WRITE_TOKEN=your_token_with_editor_or_higher
 *      (Sanity dashboard → API → Tokens → Add API token)
 *   3. Run:
 *        npx tsx scripts/seed-library-articles-2.ts
 *
 * The script uses `createOrReplace` keyed by a deterministic _id derived from
 * the slug, so re-running it is idempotent.
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

const EDITORIAL_SOURCE = "Basado en la experiencia real de Flavia Dos Santos";

const ARTICLES: SeedArticle[] = [
  {
    slug: "tu-cuerpo-tambien-merece-placer",
    title: "Tu cuerpo también merece placer",
    excerpt:
      "Hablar de sexo y gordofobia es un tabú dentro del tabú. Flavia desmonta los estigmas que se pegan al cuerpo y reivindica la auto-aceptación como puerta al placer real.",
    body: [
      "Hablar de sexo ya es un tabú. Hablar de sexo y gordofobia es un tabú dentro del tabú.",
      "Somos una sociedad gordofóbica. Los prejuicios que cargamos sobre los cuerpos que no encajan en el estándar están enraizados desde muy temprano — en los chistes, en los estereotipos, en la publicidad, en las películas donde siempre es la delgada la que seduce, la que atrae, la que tiene vida sexual.",
      "Pero los gordos tienen sexo. Pueden, deben y siguen sintiendo placer, amor y respeto, independiente de su talla o peso.",
      "El problema no es el cuerpo. El problema son los estigmas que se pegan a ese cuerpo. La inseguridad, la preocupación por el desempeño, el miedo al juicio del otro, la desconexión del propio placer porque hay demasiada energía gastada en avergonzarse.",
      "Y estadísticamente, las mujeres son las más afectadas. El impacto de esa presión es un 70% más fuerte en mujeres que en hombres — porque además de la gordofobia, cargamos el peso de vivir en una sociedad que objetifica el cuerpo femenino y lo somete a estándares estéticos que cambian con cada época.",
      "La auto-aceptación corporal es el paso básico para cualquier mujer que quiera vivir el placer de verdad. No desde la resignación — desde el derecho. Porque solo cuando te ves como deseante y deseable puedes realmente entregarte a un encuentro íntimo.",
      "Eso empieza contigo. Con el toque de tu propia piel. Con hacerte caricias en tu propio cuerpo. Con reconocerte y cuidarte. El auto-cuidado no es un baño de espuma con velas — es conocerte tanto que sabes poner límites porque sabes que lo primero eres tú.",
      "Disfrutar de pequeños placeres. Darte tiempo. Ponerte atención. No ser espectadora de tu propia vida sino actriz de tu propio placer.",
      "Porque solo así se llega a una relación íntima, amorosa, placentera y saludable — contigo misma primero, y con otras personas después.",
    ],
    topicTags: ["body_confidence", "self_connection", "pleasure"],
    intentTags: ["understanding", "reconnection"],
    sectionTag: "emocionalmente",
    audienceTags: ["mujeres"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:00:00.000Z",
  },
  {
    slug: "sensualidad-todo-empieza-antes",
    title: "La sensualidad empieza mucho antes del sexo",
    excerpt:
      "La sensualidad es el opuesto de lo común. Erotizar es lo que nos diferencia de los animales — y como cualquier buen plato, requiere tiempo y preparación.",
    body: [
      "La sensualidad está relacionada con los sentidos. Es una percepción sensorial que ocurre cuando algo despierta nuestro interés de manera especial e intensa. Y es muy asociada al erotismo porque despierta el deseo.",
      "Podemos decir que la sensualidad es el opuesto de lo vulgar, de lo común. Tiene un ingrediente misterioso.",
      "Cuando decimos que alguien es sensual no nos referimos a su belleza — nos referimos a ese misterio, a esa curiosidad que genera, a algo diferente del común.",
      "La comida siempre ha cargado ese toque sensual — por lo inusual de los sabores, las formas, las temperaturas. Y el encuentro sexual puede compararse perfectamente con la preparación de un plato. Nadie saca de la nevera y come directamente. Se calienta. Se sazona. Se prepara con cuidado y anticipación.",
      "Dentro de ese momento de preparar, despertamos la sensualidad. Porque erotizamos. Y todo lo que ponemos erotismo podemos sensualizarlo.",
      "Lo que nos diferencia de los animales es exactamente eso: la capacidad de erotizar, de transformar el sexo, los momentos, los alimentos, una mirada, una voz, en imaginación y estímulo.",
      "Comida y sexo son los grandes motores de la historia. Ambos provocan guerras, canciones, propagan la especie, influencian la política, el arte y la religión. Son mucho más poderosos de lo que pensamos.",
      "Y los dos requieren lo mismo: tiempo. Sin afán. Bien despacio.",
      "El deseo se crea. No aparece de la nada esperando que lo encuentres — se construye. Se trabaja esa narrativa. Se permiten pequeños placeres sin culpa. Se cultiva la curiosidad, la creatividad, la emoción.",
      "Porque el verdadero placer requiere tiempo. Y el tiempo, hoy en día, es el artículo de lujo más valioso que existe.",
    ],
    topicTags: ["desire", "pleasure", "curiosity"],
    intentTags: ["understanding", "exploration"],
    sectionTag: "tips_educacion_sexual",
    audienceTags: ["todos"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:05:00.000Z",
  },
  {
    slug: "hombres-ereccion-y-placer",
    title: "El sexo no termina cuando él pierde la erección",
    excerpt:
      "El pensamiento falocentrado encierra a los hombres en la idea de que sin erección no hay sexo. Soltar esa idea es liberador — para él y para quien está con él.",
    body: [
      "Cada vez más hombres evitan el encuentro sexual. Y cuando lo tienen, no logran una conexión placentera. Hay una percepción creciente de que algo está fallando — pero nadie habla de por qué.",
      "Los hombres, hasta hoy, sufren con las exigencias del mismo patriarcado que tanto daño hace a las mujeres. Un sistema que los condicionó a creer que el sexo siempre empieza con penetración, que se hace por cumplir y no por deseo, y que concentró todo el protagonismo en el pene.",
      "De ahí viene tanta angustia ante la pérdida de la erección — algo completamente común y normal en cualquier hombre del mundo, en cualquier momento de su vida. Pero que les afecta profundamente la autoestima porque, en esa lógica falocentrada, el pene flácido los cancela como hombres.",
      "Y lo más fácil es alejarse. Desaparecer. Creer que si el pene no funciona, ya no hay nada que ofrecer.",
      "Pero el sexo no termina cuando él pierde la erección. El placer no desaparece con la flacidez. El cuerpo entero está presente en el encuentro sexual — los toques, las caricias, los juegos, el momento. El cuerpo entero es fuente de sensaciones poderosas que también llevan al orgasmo.",
      "Falta diálogo. Falta educación sexual. Y sobretodo falta cuestionar ese discurso machista que encasilla a los hombres y los lleva a un sufrimiento solitario y al distanciamiento de sus parejas.",
      "Soltar el pensamiento falocentrado no es una concesión — es una liberación. Para él y para quien está con él.",
      "El sexo es lo posible. Siempre vamos a tener lo ideal, lo real y lo posible. Trabajar lo posible es lo que falta.",
    ],
    topicTags: ["erectile_dysfunction", "couple_connection", "communication"],
    intentTags: ["understanding", "reconnection"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["todos"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:10:00.000Z",
  },
  {
    slug: "como-reactivar-el-deseo",
    title: "Cómo reactivar el deseo cuando parece haberse ido",
    excerpt:
      "El deseo no desaparece — se atrofia. Tumbar mitos, erotizar y planear son las claves para volver a sentir.",
    body: [
      "Es un desafío hablar de deseo en el mundo complejo que estamos viviendo. Un mundo que nos pone varas imposibles de modelos de vida exitosa donde siempre hay que estar bien, felices y productivos.",
      "Las emociones que nos componen — el miedo, la tristeza, las dudas, la ansiedad — son completamente normales. Pero en la sociedad del éxito constante no están permitidas. Y hay una búsqueda constante por anestesiar todo lo que no represente resultados.",
      "El deseo muere ahí. En el agotamiento. En la anestesia.",
      "Pero el deseo no desaparece para siempre — se atrofia. Y lo que se atrofia, con trabajo, se puede recuperar.",
      "Lo primero: tumbar los mitos que dominan y determinan el placer.",
      "El buen sexo no es como el porno. Todos no tienen más sexo que tú. El buen sexo no tiene que ser espontáneo. No existen claves secretas para ser buen amante. Y el sexo no es lo mismo que la penetración.",
      "Lo segundo: entender que el deseo se crea. Platón decía que no podemos desear lo que ya tenemos. El deseo necesita curiosidad, falta, algo que alcanzar. Deseo es como la Coca-Cola — se construye, se trabaja, se alimenta con narrativa.",
      "Lo tercero: erotizar. Eso es exclusivo de la especie humana. La capacidad de transformar lo cotidiano en estímulo. De ver a tu pareja hacer algo que le apasiona y que eso te despierte algo. De imaginar antes de tener.",
      "Lo cuarto — y esto es clave — planear. El sexo espontáneo existe, pero el sexo planeado tiene algo que el espontáneo no tiene: la expectativa. Una cita agendada con anticipación de placer aumenta el deseo antes de que el encuentro suceda. Como preparar una buena comida versus abrir la nevera y comer lo que hay.",
      "Porque el sexo, como el amor, es bueno, es divertido, y nos da el colorido especial a nuestras vidas. Pero requiere atención, tiempo y presencia.",
      "Aquí y ahora. No el próximo viaje, el próximo amor, la próxima noche. Hoy.",
    ],
    topicTags: ["desire", "routine", "couple_connection"],
    intentTags: ["practical_ideas", "reconnection"],
    sectionTag: "lo_mas_hablado",
    audienceTags: ["todos"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:15:00.000Z",
  },
  {
    slug: "salud-mental-y-sexualidad",
    title: "Lo que tu cuerpo dice cuando tu mente no puede hablar",
    excerpt:
      "Cuerpo y mente son uno solo. El agotamiento mata el deseo, la ansiedad cierra el cuerpo. Recuperar el registro sensorial es recuperar la vida íntima.",
    body: [
      "No existe una definición oficial de salud mental según la OMS. Pero yo me gusta verla como el acceso a una vida de calidad — y como la forma en que lidiamos con las exigencias de la vida.",
      "Cuerpo y mente son uno solo. Lo que pasa por la mente se actualiza, se traduce en el cuerpo. Tratar de disociar los dos es imposible. Y sin embargo, vivimos en una sociedad que nos pide exactamente eso: producir como máquinas mientras fingimos que no sentimos nada.",
      "Las emociones que nos componen — el miedo, la tristeza, las dudas, la ansiedad — son percibidas como una plaga. El éxito está en no sentirlas, solo en satisfacerse. Y la solución que ofrece el mercado es anestesiarnos.",
      "Pero lo que no se habla no existe. Y el cuerpo y la mente se enferman.",
      "Hoy estamos perdiendo el registro sensorial. La capacidad de sentir de verdad lo que está pasando en el cuerpo — no como espectadores sino como actores de nuestra propia experiencia.",
      "Somos buenos para decir lo que no queremos. Nos cuesta mucho más decir lo que sí queremos, lo que deseamos, lo que necesitamos.",
      "Y la sexualidad es exactamente eso — la expresión más física y más emocional de lo que somos. No puedes separar cómo te sientes de cómo vives tu intimidad. El agotamiento mata el deseo antes que cualquier otra cosa. La presión del éxito constante apaga la libido. La ansiedad cierra el cuerpo.",
      "¿Qué podemos hacer? Flexibilizarnos. No tomarnos todo personal. Practicar empatía. Ser activos y no solo reactivos. Disfrutar de pequeños placeres. Darnos tiempo — que hoy es un artículo de lujo. Erotizar, porque es una fuerza de vida.",
      "Y sobre todo: autorizarnos a ser humanos. Con todo lo que eso implica.",
      "Porque el bienestar, la salud mental, el placer — todo eso es poder manejar la vida como ella es y no como nos gustaría que fuera.",
    ],
    topicTags: ["self_connection", "body_confidence", "desire"],
    intentTags: ["understanding", "reflection"],
    sectionTag: "emocionalmente",
    audienceTags: ["todos"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:20:00.000Z",
  },
  {
    slug: "soy-normal-o-solo-distinto",
    title: "¿Soy normal o simplemente distinto?",
    excerpt:
      "No existe un manual de normalidades sexuales. La pregunta no es si eres normal — es si hay respeto, comunicación y goce mutuo.",
    body: [
      "Hasta hoy no existe un manual de normalidades sexuales. Y eso, lejos de ser un problema, es una liberación — si aprendes a verlo así.",
      "Cada persona tiene el poder de crear su propia normalidad, siempre que no haya una relación de poder o control que dañe a otro. Esa es la única línea que importa.",
      "Lo saludable no se define por lo que hace la mayoría. Se define por cómo se mira al otro en ese momento íntimo. En el encuentro sano hay comunicación, hay respeto, hay goce de los dos. En lo que no es sano — independientemente de la práctica — el otro no es visto, no tiene voz, es utilizado.",
      "Los mitos que dominan la sexualidad y que generan esa pregunta de \"¿soy normal?\" son más comunes de lo que crees:",
      "Que existen dos tipos de orgasmo: vaginal y clitoriano como si fueran distintos. Que la vida sexual termina con la menopausia. Que la satisfacción depende del tamaño del pene. Que el hombre siempre está listo. Que las mujeres tienen menos deseo. Que sentir curiosidad por alguien del mismo sexo significa algo definitivo sobre tu orientación.",
      "Ninguno de esos mitos es verdad.",
      "Sentir deseo, curiosidad, fantasías que se salen de lo que creías \"normal\" para ti no significa que algo esté roto. Significa que eres humano. La sexualidad es un proceso constructivo — se aprende, se descubre, se va formando a lo largo de la vida.",
      "La pregunta no es \"¿soy normal?\". La pregunta es \"¿estoy bien? ¿el otro está bien? ¿hay respeto en lo que estoy haciendo?\"",
      "Si la respuesta a las tres es sí, eres exactamente como debes ser.",
    ],
    topicTags: ["self_connection", "curiosity", "education"],
    intentTags: ["understanding", "exploration"],
    sectionTag: "soy_normal_o_distinto",
    audienceTags: ["todos"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:25:00.000Z",
  },
  {
    slug: "tengo-miedo-al-sexo-a-la-intimidad",
    title: "Tengo miedo. Y eso también es válido.",
    excerpt:
      "El miedo en la intimidad casi siempre habla de algo. Nombrarlo es el primer paso para que no se convierta en evitación, distancia y desconexión.",
    body: [
      "El miedo en la intimidad es más común de lo que se habla. Miedo a no ser suficiente. Miedo a que te vean de verdad — el cuerpo, las inseguridades, los deseos que nunca le has contado a nadie. Miedo a pedir lo que quieres. Miedo a que si lo pides, cambien la imagen que tienen de ti.",
      "Y muchos de esos miedos no vienen de ti — vienen de años de mensajes sobre cómo debes ser, cómo debe ser tu cuerpo, qué está permitido desear y qué no.",
      "El miedo en la sexualidad casi siempre habla de algo. De una experiencia pasada que no fue bien. De una educación que llenó de vergüenza lo que debería haber sido curiosidad. De una relación donde no fue seguro ser vulnerable.",
      "Nombrar el miedo es el primer paso. No para eliminarlo de golpe — sino para empezar a entender de dónde viene.",
      "Porque el miedo que se esconde se convierte en evitación. Y la evitación se convierte en distancia. Y la distancia, con el tiempo, en desconexión.",
      "Lo que puedes hacer hoy: empezar a identificar qué momento, qué situación, qué pensamiento activa ese miedo. No tienes que resolverlo solo. La intimidad — incluso la conversación sobre el miedo — se puede compartir.",
      "Y si el miedo viene de una experiencia de abuso o trauma, ese es un territorio que merece acompañamiento profesional. No porque estés roto — sino porque mereces trabajarlo con alguien que tenga las herramientas para hacerlo bien.",
      "Aquí puedes empezar a ponerle palabras. Eso ya es mucho.",
    ],
    topicTags: ["self_connection", "communication", "body_confidence"],
    intentTags: ["reflection", "expression"],
    sectionTag: "tengo_miedo",
    audienceTags: ["todos"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:30:00.000Z",
  },
  {
    slug: "educacion-sexual-para-jovenes",
    title: "Educación sexual: lo que nadie te enseñó pero necesitabas saber",
    excerpt:
      "Más información, más conocimiento, más tranquilidad. Hablar de sexo no estimula la sexualidad — la protege.",
    body: [
      "Más información, más conocimiento, más tranquilidad. Esa es la fórmula.",
      "La educación sexual no estimula la sexualidad — la protege. Hablar de sexo con los jóvenes no los vuelve más sexuales, los vuelve más responsables, más seguros, más capaces de respetar y de pedir respeto.",
      "El silencio es el que genera los mitos peligrosos. Y los mitos peligrosos son los que hacen daño.",
      "Mitos que hay que tumbar de una vez:",
      "La masturbación no enferma, no enloquece, no sale pelo en las manos. Las mujeres sí se masturban — y es completamente normal. La primera vez no siempre sangra ni siempre duele. Sacar el pene antes sí embaraza. El alcohol y las drogas no ayudan al sexo — lo complican. Las ETS muchas veces no tienen síntomas visibles. Las mujeres tienen tanto deseo como los hombres. Sentir curiosidad por alguien del mismo sexo no determina tu orientación sexual. No hay una edad \"correcta\" para perder la virginidad.",
      "Lo que sí importa:",
      "Conocer tu cuerpo. Aprender a nombrar sus partes sin vergüenza. Entender cómo responde, qué le gusta, cuáles son sus límites. Eso no es información sexual — es inteligencia corporal. Y todos la merecen.",
      "La responsabilidad viene con el conocimiento. Tener control sobre tu cuerpo significa asumir responsabilidad con la prevención, con las elecciones y las decisiones sobre el sexo. Eso es empoderarte.",
      "Y hay algo que pocas veces se dice claramente: la empatía es parte de la educación sexual. Entender que lo que no te duele a ti puede doler mucho en el otro. Que el respeto no es opcional. Que el consentimiento no es un trámite — es la base de cualquier encuentro.",
      "Lo más bonito que puede pasarte es recorrer ese proceso de construcción de tu propia vida, tu amor propio y tu respeto hacia los demás — con información real, sin mitos, sin vergüenza.",
    ],
    topicTags: ["education"],
    intentTags: ["understanding", "practical_ideas"],
    sectionTag: "tips_educacion_sexual",
    audienceTags: ["adolescentes"],
    isPremium: false,
    editorialSource: EDITORIAL_SOURCE,
    publishedAt: "2026-04-29T10:35:00.000Z",
  },
];

function deterministicId(slug: string): string {
  return `article-tanda2-${slug}`;
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

  console.log(`Seeding ${ARTICLES.length} articles to ${projectId}/${dataset}...`);

  for (const article of ARTICLES) {
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
