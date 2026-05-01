/**
 * Seed QuicKly items — 50 Q&A extracted from "Sexo sin Misterios"
 *
 * Loads all items from C:/Users/otger/Downloads/flavia_quickly_items.md
 * (already inlined below) into Sanity as `quicklyItem` documents.
 *
 * Usage:
 *   1. Make sure SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION are set
 *      in .env.local (already present).
 *   2. Add a write token to .env.local:
 *        SANITY_WRITE_TOKEN=your_token_with_editor_or_higher
 *   3. Run:
 *        npx tsx scripts/seed-quickly-items.ts
 *
 * Idempotent: deterministic _id (`quickly-item-<slug>`) + createOrReplace.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@sanity/client";

import {
  type LibraryAudience,
  type LibraryTopicTag,
} from "@/features/library/constants";

type RawTopic =
  | "educacion_sexual"
  | "cuerpo"
  | "autoconocimiento"
  | "placer"
  | "comunicacion"
  | "pareja"
  | "limites"
  | "deseo"
  | "menopausia"
  | "curiosidad"
  | "identidad";

const TOPIC_MAP: Record<RawTopic, LibraryTopicTag> = {
  educacion_sexual: "education",
  cuerpo: "body_confidence",
  autoconocimiento: "self_connection",
  placer: "pleasure",
  comunicacion: "communication",
  pareja: "couple_connection",
  limites: "boundaries",
  deseo: "desire",
  menopausia: "menopause",
  curiosidad: "curiosity",
  identidad: "identity",
};

type SeedItem = {
  question: string;
  answer: string;
  topics: RawTopic[];
  audience: LibraryAudience[];
  isPremium: boolean;
};

const SOURCE = "libro_sexo_sin_misterios";

const ITEMS: SeedItem[] = [
  {
    question: "¿Qué quiere decir sexo \"normal\"?",
    answer:
      "No existe un manual de sexo normal. Lo que es saludable se define por cómo se mira al otro: si hay comunicación, respeto y placer mutuo, eso es lo \"normal\" que importa. La normalidad sexual cambia con la cultura, la época, el contexto. Tu normalidad la construyes tú, no la recibes.",
    topics: ["educacion_sexual"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿El placer está relacionado con la belleza física?",
    answer:
      "No. El placer está relacionado con la conexión, el conocimiento del propio cuerpo y la capacidad de comunicarse. La industria nos hizo creer que solo los cuerpos perfectos tienen derecho al placer — es mentira. Tu cuerpo, tal como es, merece placer.",
    topics: ["cuerpo", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿El sexo tiene límites?",
    answer:
      "Los únicos límites del sexo son el respeto, el consentimiento y el no hacer daño. Dentro de eso, cada persona construye su propio mapa. Lo que es límite para ti puede no serlo para otra persona, y viceversa. La conversación honesta con tu pareja define tus límites compartidos.",
    topics: ["limites", "comunicacion"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Qué pasa si dos adolescentes deciden tener sexo?",
    answer:
      "Lo que importa es la información y el contexto. Para disfrutar el sexo hay que conocerse, y en la adolescencia uno todavía está descubriendo quién es. Si va a pasar, que sea con educación sexual, con responsabilidad, con anticoncepción, y sin presión.",
    topics: ["educacion_sexual"],
    audience: ["adolescentes"],
    isPremium: false,
  },
  {
    question: "¿A qué edad es recomendable iniciar la vida sexual?",
    answer:
      "No hay una edad correcta. La sexualidad y el placer dependen de la madurez de cada quien y del contexto. No es un trámite que se cumpla en una fecha — es un proceso que se vive cuando uno está listo. Y \"estar listo\" significa entender qué pasa, querer hacerlo, y estar con alguien que respete eso.",
    topics: ["educacion_sexual"],
    audience: ["adolescentes"],
    isPremium: false,
  },
  {
    question: "¿Cómo es la primera vez para la mujer?",
    answer:
      "Casi siempre complicada y poco placentera. No por ti — por la falta de información, la tensión, la expectativa, el miedo al sangrado o al dolor. El orgasmo durante la primera vez es casi imposible. Y eso está bien. La sexualidad es algo que se aprende a lo largo de la vida, no algo que se domina de una.",
    topics: ["cuerpo", "educacion_sexual"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Cómo es la primera vez para el hombre?",
    answer:
      "Tampoco placentera. Se asume que los hombres nacen sabiendo y no es así. Tienen los mismos miedos: perder la erección, no ser suficientes, eyacular antes de tiempo, ser comparados. Cualquier pensamiento intrusivo en ese momento puede romper la erección. La primera vez es desastrosa para casi todos — y eso es normal.",
    topics: ["cuerpo", "educacion_sexual"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question:
      "¿Sigue siendo importante para los hombres ser los primeros en la vida sexual de las mujeres?",
    answer:
      "Esa fantasía sigue existiendo y es pura herencia machista. La verdad es que una mujer experimentada conoce su cuerpo, sabe qué le gusta y puede comunicarlo. Eso es ventaja, no problema. La obsesión con la virginidad dice más sobre las inseguridades de quien la pide que sobre la mujer.",
    topics: ["pareja"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question: "¿Por qué es importante la masturbación femenina?",
    answer:
      "Porque el placer se aprende. La masturbación es el primer espacio donde una mujer descubre qué le gusta, cómo responde su cuerpo, dónde están sus zonas de placer. Sin ese conocimiento, esperar que otra persona \"te lleve al orgasmo\" es como pedirle que adivine. Es información que solo tú puedes generar.",
    topics: ["cuerpo", "autoconocimiento", "placer"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Por qué es importante la masturbación masculina?",
    answer:
      "Por las mismas razones. Conocer tu cuerpo, tus tiempos, lo que te excita. Además, en hombres ayuda a aprender control eyaculatorio, a entender qué te lleva al orgasmo y a mantener tu vida sexual incluso sin pareja.",
    topics: ["cuerpo", "autoconocimiento"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question: "¿La masturbación puede ser en pareja?",
    answer:
      "Por supuesto. Es una de las mejores formas de mostrarle a tu pareja exactamente qué te gusta. Verse el uno al otro, masturbarse juntos, tocarse mientras el otro mira — todo eso es comunicación pura, sin palabras. Y para muchas parejas en rutina, reactiva el deseo.",
    topics: ["pareja", "comunicacion"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Por qué a las parejas les da pena tener sexo oral?",
    answer:
      "Por la cabeza. Por los olores, los sabores, la idea de que \"es sucio\". Pero el sexo oral es una de las formas más íntimas de cercanía. Si hay higiene básica y deseo, el cuerpo no es sucio. Lo sucio es la culpa que cargamos sobre él.",
    topics: ["comunicacion", "cuerpo"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Tragar semen es perjudicial para la salud?",
    answer:
      "No. El semen es 95% agua, proteínas, fructosa y minerales. No tiene calorías significativas ni ningún efecto negativo en personas sanas. La única precaución real es asegurarse de que la pareja no tenga ETS — y eso aplica a cualquier práctica sexual sin protección.",
    topics: ["cuerpo"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Se puede practicar el sexo oral durante el embarazo?",
    answer:
      "Sí, salvo que el médico diga lo contrario por algún riesgo específico (placenta previa, riesgo de pérdida). El embarazo no es una contraindicación para el sexo. Lo que cambia son las posiciones, el ritmo, y el deseo — que en algunas mujeres aumenta y en otras desaparece.",
    topics: ["cuerpo", "pareja"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Las fantasías sexuales se deben compartir con la pareja?",
    answer:
      "Solo si tú quieres y solo si confías en el espacio. Compartir una fantasía es vulnerable — necesita un terreno seguro. No tienes que compartir todas. Algunas fantasías ganan poder en lo privado. Otras crecen cuando se comparten. Tú decides cuáles entran en cada categoría.",
    topics: ["comunicacion", "pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "¿Si una fantasía sexual se vuelve realidad se convierte en una perversión?",
    answer:
      "No. Una fantasía hecha realidad sigue siendo fantasía si fue consensuada, si nadie sale dañado, y si te dejó algo bueno. La línea no es realidad/fantasía — es respeto/no respeto. Lo que daña a otro o se hace sin consentimiento sí es problema. Lo demás es exploración.",
    topics: ["deseo", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Qué puedo fantasear y qué no?",
    answer:
      "Puedes fantasear lo que quieras. La fantasía es el espacio más libre que tienes — nadie tiene acceso a ella si tú no quieres. Lo que importa es separar fantasía de acción. Fantasear con algo no significa que quieras hacerlo. Y no te convierte en mala persona.",
    topics: ["deseo", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Son frecuentes las fantasías sexuales que incluyen violencia?",
    answer:
      "Sí, muy frecuentes. Especialmente fantasías de sumisión o dominación. La cabeza juega con escenarios que no querríamos en la vida real — eso es exactamente lo que las hace fantasías. No te asustes de tu propia mente. Asustarte solo añade culpa donde no hace falta.",
    topics: ["autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Es verdad que hay orgasmo vaginal y orgasmo clitórico?",
    answer:
      "La distinción es más cultural que anatómica. El clítoris es un órgano grande del que solo vemos una pequeña parte — sus terminaciones nerviosas se extienden hasta la pared vaginal. El llamado \"punto G\" es en realidad parte del mismo sistema. Hay diferentes tipos de orgasmo, sí, pero todos vienen de estructuras conectadas.",
    topics: ["cuerpo", "placer"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Es verdad que las mujeres pueden tener orgasmos múltiples?",
    answer:
      "Sí. Las mujeres no tienen el mismo período refractario que los hombres después del orgasmo, lo que significa que pueden tener varios seguidos si la estimulación continúa. No todas las mujeres los tienen ni los buscan — y eso también está bien. No es un requisito.",
    topics: ["cuerpo", "placer"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Para tener buen sexo es requisito tener un orgasmo?",
    answer:
      "No. El orgasmo es el postre, no el plato fuerte. El sexo es las sensaciones, el toque, la conexión, la intimidad — todo eso es el plato principal. Si te quedas sin orgasmo pero el encuentro fue conectado y placentero, fue buen sexo. Convertir el orgasmo en obligación es la manera más rápida de matarlo.",
    topics: ["placer", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Existen tratamientos para la anorgasmia?",
    answer:
      "Sí. Y casi siempre el tratamiento es psicológico antes que médico. La mayoría de anorgasmias vienen de presión, ansiedad, falta de autoconocimiento o trauma. Trabajar contigo misma — masturbación consciente, terapia sexual, comunicación con la pareja — resuelve más casos de los que crees.",
    topics: ["placer", "cuerpo"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question:
      "¿La eyaculación precoz tiene algo que ver con la disfunción eréctil?",
    answer:
      "Pueden estar relacionadas. La ansiedad por la eyaculación precoz puede generar tensión, y esa tensión puede llevar a perder la erección. Es un círculo vicioso. Ambas se trabajan juntas — y casi siempre el origen es psicológico antes que físico.",
    topics: ["cuerpo"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question:
      "¿Cuándo un hombre debe pensar que tiene un problema de eyaculación precoz?",
    answer:
      "Cuando es un patrón recurrente que afecta tu vida sexual y la de tu pareja. Eyacular antes de tiempo en una primera vez, en momentos de ansiedad o cuando hay mucha excitación es completamente normal. El problema es cuando se vuelve sistemático y empieza a generar evitación del sexo.",
    topics: ["cuerpo"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question:
      "¿Es posible que un hombre tenga eyaculación precoz con algunas personas y con otras no?",
    answer:
      "Totalmente posible. Eso confirma que el componente es más psicológico que fisiológico. La química con cada pareja, el nivel de confianza, la presión que sientes — todo influye. Si te pasa solo con algunas personas, no es un problema mecánico — es información sobre cómo te sientes con cada quien.",
    topics: ["pareja", "cuerpo"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question: "¿Los matrimonios abiertos funcionan?",
    answer:
      "Funcionan cuando ambas personas lo eligen libremente, tienen reglas claras, y comunicación constante. No funcionan cuando una persona lo acepta para no perder a la otra, o cuando se usa para evitar problemas que ya existían. La apertura no resuelve crisis — las amplifica.",
    topics: ["pareja", "comunicacion"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "¿Cuál es la diferencia entre un matrimonio abierto y una pareja swinger?",
    answer:
      "En el matrimonio abierto cada persona puede tener encuentros por separado, con o sin la otra. En el swinger los encuentros son siempre en pareja, juntos. Son dinámicas distintas con riesgos y satisfacciones distintos. Ninguna es mejor — depende de qué busca cada pareja.",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Es posible hablar de promiscuidad en un universo swinger?",
    answer:
      "La palabra \"promiscuidad\" carga juicio. En contextos donde hay reglas claras, consentimiento, y respeto, lo que para alguien es promiscuidad para otro es simplemente diversidad. La pregunta no es cuántos — es cómo. Si todos los involucrados están bien, el número no es el tema.",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "¿Con el sexo anal hay más riesgo de contraer enfermedades de transmisión sexual?",
    answer:
      "Sí. La mucosa anal es más fina y se lastima más fácilmente que la vaginal, lo que aumenta la transmisión de infecciones. Por eso el preservativo en sexo anal no es opcional — es esencial. Y la lubricación abundante también, no solo por el placer, también para evitar microheridas.",
    topics: ["cuerpo", "educacion_sexual"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Qué pasa si un hombre eyacula durante el sexo anal?",
    answer:
      "No pasa nada físicamente problemático si hay preservativo. Sin preservativo, además del riesgo de ETS, puede haber alteraciones en la flora rectal. La eyaculación dentro de cualquier cavidad sin protección siempre tiene implicaciones — el ano no es una excepción.",
    topics: ["cuerpo", "pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿La vida sexual termina con la menopausia?",
    answer:
      "No, en absoluto. Cambia, pero no termina. Muchas mujeres descubren después de la menopausia una libertad sexual que no habían tenido — sin miedo al embarazo, con los hijos crecidos, con más conocimiento de su cuerpo. El cuerpo cambia, los ritmos cambian, pero el placer no caduca.",
    topics: ["menopausia", "deseo"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Cómo se trata la falta de deseo en la tercera edad?",
    answer:
      "Primero, sin medicalizar de entrada. La falta de deseo en la tercera edad casi siempre tiene contexto: cansancio acumulado, rutina, distancia emocional con la pareja, cambios hormonales. Se trabaja por capas — primero contexto, luego pareja, luego cuerpo. Las pastillas son la última opción, no la primera.",
    topics: ["deseo", "menopausia"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "¿Por qué algunos hombres mayores buscan formar pareja con mujeres mucho más jóvenes?",
    answer:
      "Por muchas razones, no todas iguales. Algunos buscan recuperar juventud, otros admiración, otros control. Y algunos simplemente conectan con personas más jóvenes por afinidad real. La pregunta no es la edad — es qué se busca y si las dos personas están allí desde el deseo, no desde la necesidad.",
    topics: ["pareja"],
    audience: ["hombres"],
    isPremium: false,
  },
  {
    question:
      "¿Qué pasa si una persona o pareja mayor decide no tener más sexo?",
    answer:
      "Está bien si es una decisión consciente y de los dos. Lo que no está bien es la renuncia silenciosa — \"ya para qué\". Si decides que el sexo ya no es parte de tu vida, perfecto. Pero hablarlo, no asumirlo. La intimidad no termina con el sexo, pero merece ser nombrada.",
    topics: ["pareja", "comunicacion"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "¿Hasta qué punto la fantasía de la dilatación compromete la futura sexualidad?",
    answer:
      "La vagina es músculo. Vuelve. Los ejercicios de Kegel y el suelo pélvico son reales y funcionan. La idea de que \"ya nunca volverá a ser igual\" es más un mito que una realidad clínica. Lo que sí cambia es la mujer — y a veces para mejor en su sexualidad.",
    topics: ["cuerpo", "autoconocimiento"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question:
      "¿Es verdad que algunas mujeres tienen orgasmos durante el parto?",
    answer:
      "Sí, sucede. No es lo común y no es lo que la mayoría espera, pero existe. El cuerpo en el parto pasa por una intensidad sensorial única, y para algunas mujeres se conecta con el placer. No es algo que se busca — pero si pasa, no es raro ni inapropiado.",
    topics: ["cuerpo", "placer"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question:
      "¿Después del embarazo, cuánto tiempo es recomendable esperar antes de retomar la vida sexual?",
    answer:
      "Lo que diga el médico para la cicatrización interna — usualmente 6 semanas. Pero \"vida sexual\" no es solo penetración. Las caricias, los toques, la cercanía pueden volver mucho antes. Y el deseo puede tardar meses, sobre todo si amamantas. No hay calendario. Cada cuerpo a su tiempo.",
    topics: ["cuerpo", "pareja"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Un homosexual nace o se hace?",
    answer:
      "La ciencia hoy acepta que la orientación sexual tiene componentes biológicos, hormonales y de desarrollo temprano. Pero más allá del debate científico, la pregunta importante es otra: ¿por qué necesitas que sea de una manera específica para aceptarlo? La orientación es lo que es, y merece respeto independiente de su origen.",
    topics: ["identidad", "autoconocimiento"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Una experiencia con alguien del mismo sexo te hace homosexual?",
    answer:
      "No. La curiosidad, la experimentación, las experiencias puntuales son parte de la sexualidad humana. La orientación no se define por una experiencia — se define por dónde está tu deseo de forma sostenida. Probar no etiqueta. La etiqueta la pones tú cuando reconoces tu propio mapa.",
    topics: ["identidad", "curiosidad"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "Si pregonamos libertad sexual, ¿por qué sigue habiendo tanta represión hacia la homosexualidad?",
    answer:
      "Porque la libertad de la que se habla muchas veces es selectiva. Aceptamos la diversidad mientras no nos toque de cerca. La represión hacia la homosexualidad viene del miedo a lo distinto, de creencias heredadas, y de un patriarcado que necesita roles fijos para sostenerse. El trabajo es de todos, no solo de las personas LGBT+.",
    topics: ["identidad"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿La normalidad sexual está relacionada con la cultura?",
    answer:
      "Completamente. Lo que es normal en una cultura puede ser tabú en otra. Lo que era escandaloso hace 50 años hoy es cotidiano. La normalidad sexual no es una verdad universal — es un acuerdo cultural que cambia. Conocer eso te libera de muchas culpas que no son tuyas, son de tu contexto.",
    topics: ["educacion_sexual"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Por qué las mujeres no hablamos mucho de sexo entre nosotras?",
    answer:
      "Por miedo a parecer \"expertas\". Por la idea machista de que una mujer experimentada es una mujer \"fácil\". Pero debería ser al revés — una mujer que conoce su cuerpo, que sabe qué le gusta, es una compañera mejor para sí misma y para quien esté con ella. Hablar de sexo entre mujeres es ganar libertad.",
    topics: ["comunicacion"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question:
      "¿Por qué cada encuentro sexual con una pareja diferente es una primera vez?",
    answer:
      "Porque cada cuerpo es distinto, cada química es distinta, cada ritmo es distinto. Lo que funcionó con una persona puede no funcionar con otra. Eso no es malo — es información. Cada pareja te enseña algo nuevo sobre ti y sobre el sexo. Por eso la experiencia importa: no para \"saber más\", sino para conocerte mejor.",
    topics: ["pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "¿Por qué las mujeres tenemos menos deseo según los estudios?",
    answer:
      "No tenemos menos deseo. Tenemos un deseo distinto: más contextual, más conectado al ambiente, al estado emocional, al cansancio. Los estudios miden el deseo desde una lógica masculina (espontáneo, visual, urgente) y por eso parece que tenemos menos. Pero es solo otra forma de desear.",
    topics: ["deseo"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Qué hacer si nunca he tenido un orgasmo?",
    answer:
      "Empezar contigo. La masturbación consciente — sin prisa, sin objetivo, explorando qué te gusta — es el primer paso. Si después de explorar a fondo sigue sin pasar, terapia sexual. Pero antes de pensar que \"algo está mal en ti\", date el espacio de aprenderte. La mayoría de las mujeres no tienen orgasmo por falta de información, no por incapacidad.",
    topics: ["placer", "autoconocimiento"],
    audience: ["mujeres"],
    isPremium: false,
  },
  {
    question: "¿Por qué se acaba el deseo en las parejas largas?",
    answer:
      "Porque el deseo necesita distancia. Cuando todo se vuelve familiar, predecible, cotidiano, el deseo pierde el aire que necesita para arder. Fuego necesita aire. La pareja larga que mantiene deseo es la que protege el espacio entre los dos — la que sigue teniendo curiosidad por el otro.",
    topics: ["deseo", "pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Cómo puedo reactivar mi deseo sexual?",
    answer:
      "Empezando por el contexto: ¿estás durmiendo bien? ¿comunicándote con tu pareja? ¿tienes tiempo para ti? El deseo no se \"fuerza\" — se cultiva. Erotizar lo cotidiano, planear encuentros (sí, planear, no solo improvisar), permitir pequeños placeres sin culpa. El deseo es músculo: vuelve cuando se ejercita.",
    topics: ["deseo"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question:
      "¿Cómo le digo a mi pareja lo que me gusta sin que se ofenda?",
    answer:
      "Empezando por lo que te gusta, no por lo que falta. \"Me encantó cuando hiciste X\" funciona mejor que \"no me gusta cuando haces Y\". La comunicación sexual no tiene que ser una crítica — puede ser un mapa. Y los mapas se construyen mejor con curiosidad que con quejas.",
    topics: ["comunicacion", "pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Qué hago si mi pareja no quiere hablar de sexo?",
    answer:
      "Primero entender por qué. ¿Vergüenza? ¿Miedo a ser juzgada? ¿Una historia previa difícil? Hablar de no querer hablar también es una forma de empezar a hablar. Y a veces la conversación no tiene que ser sobre sexo — puede empezar por intimidad, por afecto, por confianza. El sexo viene después.",
    topics: ["comunicacion", "pareja"],
    audience: ["todos"],
    isPremium: false,
  },
  {
    question: "¿Cuál es el verdadero secreto de una buena vida sexual?",
    answer:
      "No hay secreto. Es información, comunicación, curiosidad y tiempo. Conocerte a ti, conocer a quien está contigo, atreverte a preguntar y atreverte a responder. La buena vida sexual no se logra de una — se cultiva a lo largo de los años. Como cualquier cosa importante.",
    topics: ["autoconocimiento", "placer"],
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

  console.log(`Seeding ${ITEMS.length} QuicKly items to ${projectId}/${dataset}...`);

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
      publishedAt: "2026-04-30T10:00:00.000Z",
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
