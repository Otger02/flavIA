import type {
  LibraryContentType,
  LibraryIntentTag,
  LibraryTopicTag,
} from "@/features/library/constants";

export type RealLibraryItem = {
  body: string[];
  chatRecommended: boolean;
  contentType: LibraryContentType;
  coverImageUrl: string;
  editorialSource: string;
  excerpt: string;
  id: string;
  intentTags: LibraryIntentTag[];
  isPremium: boolean;
  publishedAt: string;
  relatedContentSlugs: string[];
  relatedProducts: Array<{ href: string; title: string }>;
  slug: string;
  title: string;
  topicTags: LibraryTopicTag[];
  youtubeUrl?: string;
};

export const REAL_LIBRARY_EDITORIAL_SOURCE = "Basado en la experiencia real de Flavia Dos Santos";

export const realLibraryContent: RealLibraryItem[] = [
  {
    id: "real-video-como-decir-lo-dificil",
    title: "Video: como decir algo dificil sin romper la conversacion",
    slug: "video-como-decir-algo-dificil-sin-romper-la-conversacion",
    excerpt: "Una pieza para cuando sabes que tienes que hablar, pero temes abrir algo que luego no sepas sostener.",
    coverImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Este video esta pensado para ese momento previo en el que te tiembla mas el inicio que la conversacion completa.",
      "La clave no es sonar perfecta. Es llegar con una intencion limpia, una frase simple y suficiente regulacion emocional para no atacar ni desaparecer.",
    ],
    topicTags: ["communication", "boundaries"],
    intentTags: ["expression", "practical_ideas"],
    contentType: "video",
    isPremium: false,
    publishedAt: "2026-04-08T10:00:00.000Z",
    relatedContentSlugs: ["articulo-como-decir-lo-que-necesitas-sin-herir", "script-para-empezar-una-conversacion-dificil"],
    relatedProducts: [],
    chatRecommended: true,
    editorialSource: REAL_LIBRARY_EDITORIAL_SOURCE,
    youtubeUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
  },
  {
    id: "real-video-celos-y-bloqueo",
    title: "Video: que hacer cuando los celos te bloquean",
    slug: "video-que-hacer-cuando-los-celos-te-bloquean",
    excerpt: "Para entender que hay debajo del miedo y como volver a hablar antes de que todo se convierta en defensa.",
    coverImageUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
    body: [
      "A veces los celos no hablan de la otra persona, sino del miedo a no ser elegida, a perder el lugar o a no saber como pedir calma.",
      "Este video te ayuda a distinguir emocion, historia y necesidad para que no llegues a la conversacion disparando desde el dolor.",
    ],
    topicTags: ["jealousy", "couple_connection"],
    intentTags: ["understanding", "reflection"],
    contentType: "video",
    isPremium: false,
    publishedAt: "2026-04-08T10:05:00.000Z",
    relatedContentSlugs: ["articulo-cuando-el-deseo-baja-no-significa-que-todo-vaya-mal"],
    relatedProducts: [],
    chatRecommended: true,
    editorialSource: REAL_LIBRARY_EDITORIAL_SOURCE,
    youtubeUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
  },
  {
    id: "real-video-reconectar-sin-forzar",
    title: "Video: como volver a acercarte sin forzar nada",
    slug: "video-como-volver-a-acercarte-sin-forzar-nada",
    excerpt: "Una guia breve para cuando sientes distancia en pareja y no quieres empeorarla intentando arreglarlo demasiado rapido.",
    coverImageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Cuando hay distancia, la tentacion suele ser hablar demasiado pronto o callar demasiado tiempo.",
      "Aqui la idea es otra: recuperar clima, presencia y posibilidad de encuentro antes de exigir respuestas definitivas.",
    ],
    topicTags: ["couple_connection", "routine"],
    intentTags: ["reconnection", "practical_ideas"],
    contentType: "video",
    isPremium: true,
    publishedAt: "2026-04-08T10:10:00.000Z",
    relatedContentSlugs: ["articulo-como-volver-a-hablar-desde-la-calma"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
    editorialSource: REAL_LIBRARY_EDITORIAL_SOURCE,
    youtubeUrl: "https://www.youtube.com/embed/XGSy3_Czz8k",
  },
  {
    id: "real-article-needs-without-hurting",
    title: "Como decir lo que necesitas sin herir ni desaparecer",
    slug: "articulo-como-decir-lo-que-necesitas-sin-herir",
    excerpt: "Una pieza para cuando llevas demasiado tiempo callando algo y ya no quieres seguir pagandolo por dentro.",
    coverImageUrl: "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Muchas personas no callan porque no sepan lo que sienten, sino porque temen lo que puede pasar cuando lo digan en voz alta.",
      "Hablar con cuidado no significa minimizarte. Significa elegir una forma que abra escucha sin traicionarte por el camino.",
      "A veces la conversacion mejora no porque tengas mejores argumentos, sino porque dejas de hablar desde la acumulacion.",
    ],
    topicTags: ["communication", "boundaries"],
    intentTags: ["expression", "reflection"],
    contentType: "article",
    isPremium: false,
    publishedAt: "2026-04-08T10:15:00.000Z",
    relatedContentSlugs: ["script-para-empezar-una-conversacion-dificil"],
    relatedProducts: [],
    chatRecommended: true,
    editorialSource: REAL_LIBRARY_EDITORIAL_SOURCE,
  },
  {
    id: "real-article-desire-lowers",
    title: "Cuando el deseo baja, no significa que todo vaya mal",
    slug: "articulo-cuando-el-deseo-baja-no-significa-que-todo-vaya-mal",
    excerpt: "Una lectura para dejar de vivir el deseo como examen constante y empezar a mirarlo como una conversacion pendiente.",
    coverImageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
    body: [
      "El deseo se mueve. Cambia con el estres, la rutina, el cansancio, la distancia emocional y todo lo que no encuentra palabras.",
      "El problema suele empezar cuando interpretas ese cambio como prueba de que algo esta roto en ti o en la relacion.",
      "A veces lo mas intimo no es recuperar el deseo en ese instante, sino aprender a hablar de el sin verguenza ni presion.",
    ],
    topicTags: ["desire", "routine", "pleasure"],
    intentTags: ["understanding", "reconnection"],
    contentType: "article",
    isPremium: true,
    publishedAt: "2026-04-08T10:20:00.000Z",
    relatedContentSlugs: ["video-como-volver-a-acercarte-sin-forzar-nada"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
    editorialSource: REAL_LIBRARY_EDITORIAL_SOURCE,
  },
  {
    id: "real-script-hard-conversation",
    title: "Script para empezar una conversacion dificil",
    slug: "script-para-empezar-una-conversacion-dificil",
    excerpt: "Frases de apoyo para abrir una conversacion incomoda sin entrar en defensa ni sonar ensayada.",
    coverImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Puedes empezar asi: 'No quiero pelear, pero necesito decirte algo que llevo dentro hace tiempo'.",
      "Otra forma posible: 'No se decir esto perfecto, pero si se que ya no quiero seguir callandolo'.",
      "La intencion no es controlar la reaccion de la otra persona. Es entrar a la conversacion con mas verdad y menos ataque.",
    ],
    topicTags: ["communication", "boundaries"],
    intentTags: ["expression", "practical_ideas"],
    contentType: "script",
    isPremium: false,
    publishedAt: "2026-04-08T10:25:00.000Z",
    relatedContentSlugs: ["articulo-como-decir-lo-que-necesitas-sin-herir"],
    relatedProducts: [],
    chatRecommended: true,
    editorialSource: REAL_LIBRARY_EDITORIAL_SOURCE,
  },
  {
    id: "real-script-boundaries",
    title: "Script para decir esto no con claridad y calma",
    slug: "script-para-decir-esto-no-con-claridad-y-calma",
    excerpt: "Un apoyo practico para cuando necesitas marcar un limite y no quieres acabar justificandote durante media hora.",
    coverImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    body: [
      "Puedes usar una estructura simple: nombra el limite, nombra por que importa y cierra sin abrir negociacion si no la hay.",
      "Por ejemplo: 'Esto no me hace bien y necesito que aqui paremos'.",
      "El objetivo no es sonar dura. Es dejar de confundirte a ti misma mientras intentas cuidar al otro.",
    ],
    topicTags: ["boundaries", "self_connection", "communication"],
    intentTags: ["expression", "practical_ideas"],
    contentType: "script",
    isPremium: true,
    publishedAt: "2026-04-08T10:30:00.000Z",
    relatedContentSlugs: ["articulo-como-decir-lo-que-necesitas-sin-herir"],
    relatedProducts: [{ title: "Flavia Plus", href: "/plans" }],
    chatRecommended: true,
    editorialSource: REAL_LIBRARY_EDITORIAL_SOURCE,
  },
];