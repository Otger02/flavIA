import type {
  LibraryContentType,
  LibraryIntentTag,
  LibraryTopicTag,
} from "@/features/library/constants";

export type MockLibraryItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  body: string[];
  topicTags: LibraryTopicTag[];
  intentTags: LibraryIntentTag[];
  contentType: LibraryContentType;
  isPremium: boolean;
  publishedAt: string;
  relatedContentSlugs: string[];
  relatedProducts: Array<{ href: string; title: string }>;
  chatRecommended: boolean;
};

export const mockLibraryContent: MockLibraryItem[] = [
  {
    id: "mock-article-communication-without-attacking",
    title: "Cómo decir algo difícil sin atacar",
    slug: "como-decir-algo-dificil-sin-atacar",
    excerpt: "Una guía breve para bajar la tensión y empezar una conversación delicada sin entrar en defensa o reproche.",
    coverImageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Cuando algo duele, es fácil entrar a la conversación desde la presión o el miedo. Eso no significa que estés haciéndolo mal; significa que te importa.",
      "Empieza nombrando tu intención antes que el problema. A veces una frase como 'quiero decirte esto sin pelear' cambia el tono completo.",
      "Después, habla desde tu experiencia concreta: qué sentiste, cuándo pasó y qué necesitarías ahora para sentir más calma.",
    ],
    topicTags: ["communication", "boundaries"],
    intentTags: ["expression", "practical_ideas"],
    contentType: "article",
    isPremium: false,
    publishedAt: "2026-04-08T09:00:00.000Z",
    relatedContentSlugs: ["guion-para-empezar-una-conversacion-incomoda", "como-volver-a-hablar-desde-la-calma"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
  },
  {
    id: "mock-guide-jealousy-freeze",
    title: "Qué hacer cuando sientes celos y te bloqueas",
    slug: "que-hacer-cuando-sientes-celos-y-te-bloqueas",
    excerpt: "Un marco simple para distinguir miedo, imaginación y necesidad real antes de hablar desde la herida.",
    coverImageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Los celos no siempre hablan de la otra persona. Muchas veces hablan de lo que temes perder o de lo insegura que te sientes en ese momento.",
      "Antes de reaccionar, intenta responder tres preguntas: qué pasó, qué imaginaste y qué necesidad se activó en ti.",
      "Cuando logras separar eso, la conversación deja de ser acusación y se vuelve claridad.",
    ],
    topicTags: ["jealousy", "couple_connection"],
    intentTags: ["understanding", "reflection"],
    contentType: "guide",
    isPremium: false,
    publishedAt: "2026-04-08T09:05:00.000Z",
    relatedContentSlugs: ["como-volver-a-hablar-desde-la-calma"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
  },
  {
    id: "mock-article-desire-drops",
    title: "Por qué el deseo baja sin que todo vaya mal",
    slug: "por-que-el-deseo-baja-sin-que-todo-vaya-mal",
    excerpt: "Una pieza para entender por qué el deseo cambia y cómo hablar de ello sin convertirlo en alarma.",
    coverImageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    body: [
      "El deseo no es un interruptor fijo. Cambia con el estrés, la desconexión, la rutina, el cansancio y también con lo que no se dice.",
      "Hablar del deseo no requiere tener una respuesta perfecta. Requiere una forma menos defensiva de nombrar lo que cambió.",
      "A veces el alivio empieza cuando dejas de interpretar la bajada de deseo como una sentencia sobre la relación.",
    ],
    topicTags: ["desire", "routine"],
    intentTags: ["understanding", "reconnection"],
    contentType: "article",
    isPremium: true,
    publishedAt: "2026-04-08T09:10:00.000Z",
    relatedContentSlugs: ["rutina-en-pareja-como-romperla-sin-forzar"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
  },
  {
    id: "mock-guide-calm-conversation",
    title: "Cómo volver a hablar desde la calma",
    slug: "como-volver-a-hablar-desde-la-calma",
    excerpt: "Tres movimientos simples para retomar una conversación cuando ya hubo tensión, silencio o distancia.",
    coverImageUrl: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Volver a hablar no significa seguir donde se quedó la pelea. A veces significa volver a abrir con otro tono.",
      "Empieza nombrando el clima que quieres crear, no el error que quieres corregir.",
      "Una conversación calmada suele empezar con una frase breve, una pausa y una intención clara.",
    ],
    topicTags: ["communication", "couple_connection"],
    intentTags: ["reconnection", "expression"],
    contentType: "guide",
    isPremium: false,
    publishedAt: "2026-04-08T09:15:00.000Z",
    relatedContentSlugs: ["como-decir-algo-dificil-sin-atacar"],
    relatedProducts: [],
    chatRecommended: true,
  },
  {
    id: "mock-script-boundaries",
    title: "Límites: cómo decir 'esto no'",
    slug: "limites-como-decir-esto-no",
    excerpt: "Un script breve para marcar un límite con firmeza y cuidado, sin justificarte de más.",
    coverImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Poner un límite no te vuelve fría ni egoísta. Te vuelve clara.",
      "Puedes empezar con una frase simple: 'esto no me hace bien y necesito poner un límite aquí'.",
      "Si la otra persona reacciona mal, no invalida tu necesidad. Solo confirma que hacía falta nombrarla.",
    ],
    topicTags: ["boundaries", "communication"],
    intentTags: ["expression", "practical_ideas"],
    contentType: "script",
    isPremium: true,
    publishedAt: "2026-04-08T09:20:00.000Z",
    relatedContentSlugs: ["como-decir-algo-dificil-sin-atacar"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
  },
  {
    id: "mock-guide-routine",
    title: "Rutina en pareja: cómo romperla sin forzar",
    slug: "rutina-en-pareja-como-romperla-sin-forzar",
    excerpt: "Ideas pequeñas para salir del automático y recuperar novedad sin convertirlo en una obligación.",
    coverImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    body: [
      "La rutina no siempre es falta de amor. Muchas veces es exceso de inercia.",
      "Romperla no exige grandes gestos. A veces basta con cambiar el tono, el contexto o el tipo de pregunta que os hacéis.",
      "Lo importante no es hacer algo impresionante, sino salir juntos del piloto automático.",
    ],
    topicTags: ["routine", "couple_connection", "pleasure"],
    intentTags: ["practical_ideas", "exploration"],
    contentType: "guide",
    isPremium: false,
    publishedAt: "2026-04-08T09:25:00.000Z",
    relatedContentSlugs: ["por-que-el-deseo-baja-sin-que-todo-vaya-mal"],
    relatedProducts: [],
    chatRecommended: true,
  },
  {
    id: "mock-script-hard-conversation",
    title: "Guión para empezar una conversación incómoda",
    slug: "guion-para-empezar-una-conversacion-incomoda",
    excerpt: "Una estructura corta y usable para empezar a hablar cuando temes que la conversación se tuerza rápido.",
    coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Prueba esta estructura: intención, emoción, hecho concreto y petición pequeña.",
      "Por ejemplo: 'quiero hablar de esto sin discutir; me removió lo que pasó ayer; cuando ocurrió me cerré; me ayudaría que lo revisáramos con calma'.",
      "No necesitas hacerlo perfecto. Solo suficientemente claro para abrir una conversación mejor.",
    ],
    topicTags: ["communication", "boundaries"],
    intentTags: ["expression", "practical_ideas"],
    contentType: "script",
    isPremium: false,
    publishedAt: "2026-04-08T09:30:00.000Z",
    relatedContentSlugs: ["como-decir-algo-dificil-sin-atacar"],
    relatedProducts: [],
    chatRecommended: true,
  },
  {
    id: "mock-audio-before-speaking",
    title: "Audio corto para ordenar lo que sientes antes de hablar",
    slug: "audio-corto-para-ordenar-lo-que-sientes-antes-de-hablar",
    excerpt: "Un recurso breve para bajar el ruido interno y llegar a la conversación con un poco más de claridad.",
    coverImageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Este audio está pensado para ese momento en el que sabes que necesitas hablar, pero todavía no sabes desde dónde hacerlo.",
      "Primero te ayuda a bajar activación. Después, a distinguir lo que sientes de lo que imaginas.",
      "En pocos minutos puedes salir con una frase inicial más limpia y menos reactiva.",
    ],
    topicTags: ["self_connection", "communication"],
    intentTags: ["reflection", "understanding"],
    contentType: "audio",
    isPremium: true,
    publishedAt: "2026-04-08T09:35:00.000Z",
    relatedContentSlugs: ["guion-para-empezar-una-conversacion-incomoda"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
  },
];