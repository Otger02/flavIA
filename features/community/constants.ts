export const COMMUNITY_TOPICS = [
  "desire",
  "couple_connection",
  "self_connection",
  "communication",
  "body_confidence",
  "routine",
  "curiosity",
  "jealousy",
  "boundaries",
  "pleasure",
] as const;

export type CommunityTopic = (typeof COMMUNITY_TOPICS)[number];

export const COMMUNITY_TOPIC_LABELS: Record<CommunityTopic, string> = {
  desire: "Deseo",
  couple_connection: "Conexion de pareja",
  self_connection: "Conexion propia",
  communication: "Comunicacion",
  body_confidence: "Confianza corporal",
  routine: "Rutina",
  curiosity: "Curiosidad",
  jealousy: "Celos",
  boundaries: "Limites",
  pleasure: "Placer",
};

export const COMMUNITY_TOPIC_COLORS: Record<CommunityTopic, string> = {
  desire: "bg-rose-100 text-rose-700 border-rose-200",
  couple_connection: "bg-pink-100 text-pink-700 border-pink-200",
  self_connection: "bg-violet-100 text-violet-700 border-violet-200",
  communication: "bg-sky-100 text-sky-700 border-sky-200",
  body_confidence: "bg-amber-100 text-amber-700 border-amber-200",
  routine: "bg-stone-100 text-stone-600 border-stone-200",
  curiosity: "bg-teal-100 text-teal-700 border-teal-200",
  jealousy: "bg-orange-100 text-orange-700 border-orange-200",
  boundaries: "bg-indigo-100 text-indigo-700 border-indigo-200",
  pleasure: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
};

// Rate limits for free users
export const FREE_STORIES_PER_WEEK = 1;
export const FREE_REPLIES_PER_DAY = 3;

// Content length limits
export const THREAD_TITLE_MIN = 5;
export const THREAD_TITLE_MAX = 200;
export const THREAD_BODY_MIN = 20;
export const THREAD_BODY_MAX = 10000;
export const COMMENT_MIN = 1;
export const COMMENT_MAX = 3000;
