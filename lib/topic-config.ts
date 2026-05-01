/**
 * Unified Topic Configuration
 *
 * Single source of truth for all topic-related labels, colors, and metadata.
 * Every file in the app should import from here instead of defining its own maps.
 */

// ── All platform topics ────────────────────────────────────────────────
export const ALL_TOPICS = [
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
  "menopause",
  "erectile_dysfunction",
  "education",
  "identity",
] as const;

export type TopicSlug = (typeof ALL_TOPICS)[number];

// ── Translation keys ───────────────────────────────────────────────────
export const TOPIC_TRANSLATION_KEYS: Record<TopicSlug, `topics.${TopicSlug}`> = {
  desire: "topics.desire",
  couple_connection: "topics.couple_connection",
  self_connection: "topics.self_connection",
  communication: "topics.communication",
  body_confidence: "topics.body_confidence",
  routine: "topics.routine",
  curiosity: "topics.curiosity",
  jealousy: "topics.jealousy",
  boundaries: "topics.boundaries",
  pleasure: "topics.pleasure",
  menopause: "topics.menopause",
  erectile_dysfunction: "topics.erectile_dysfunction",
  education: "topics.education",
  identity: "topics.identity",
};

// ── Badge / tag colors ─────────────────────────────────────────────────
export const TOPIC_BADGE_COLORS: Record<TopicSlug, string> = {
  desire: "bg-rose-100 text-rose-700",
  couple_connection: "bg-pink-100 text-pink-700",
  self_connection: "bg-teal-100 text-teal-700",
  communication: "bg-violet-100 text-violet-700",
  body_confidence: "bg-orange-100 text-orange-700",
  routine: "bg-stone-100 text-stone-700",
  curiosity: "bg-indigo-100 text-indigo-700",
  jealousy: "bg-amber-100 text-amber-700",
  boundaries: "bg-sky-100 text-sky-700",
  pleasure: "bg-fuchsia-100 text-fuchsia-700",
  menopause: "bg-purple-100 text-purple-700",
  erectile_dysfunction: "bg-blue-100 text-blue-700",
  education: "bg-emerald-100 text-emerald-700",
  identity: "bg-rose-100 text-rose-800",
};

// ── Filter pill colors (active/inactive states for library-style filters) ──
export const TOPIC_FILTER_COLORS: Record<TopicSlug, { active: string; inactive: string }> = {
  desire: { active: "bg-rose-500 text-white", inactive: "bg-rose-50 text-rose-700 hover:bg-rose-100" },
  couple_connection: { active: "bg-pink-500 text-white", inactive: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
  self_connection: { active: "bg-teal-500 text-white", inactive: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
  communication: { active: "bg-violet-500 text-white", inactive: "bg-violet-50 text-violet-700 hover:bg-violet-100" },
  body_confidence: { active: "bg-orange-500 text-white", inactive: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
  routine: { active: "bg-stone-700 text-white", inactive: "bg-stone-100 text-stone-700 hover:bg-stone-200" },
  curiosity: { active: "bg-indigo-500 text-white", inactive: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
  jealousy: { active: "bg-amber-500 text-white", inactive: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
  boundaries: { active: "bg-sky-500 text-white", inactive: "bg-sky-50 text-sky-700 hover:bg-sky-100" },
  pleasure: { active: "bg-fuchsia-500 text-white", inactive: "bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100" },
  menopause: { active: "bg-purple-500 text-white", inactive: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
  erectile_dysfunction: { active: "bg-blue-500 text-white", inactive: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  education: { active: "bg-emerald-500 text-white", inactive: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
  identity: { active: "bg-rose-600 text-white", inactive: "bg-rose-50 text-rose-800 hover:bg-rose-100" },
};

// ── Community border variant ───────────────────────────────────────────
export const TOPIC_COMMUNITY_COLORS: Record<TopicSlug, string> = {
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
  menopause: "bg-purple-100 text-purple-700 border-purple-200",
  erectile_dysfunction: "bg-blue-100 text-blue-700 border-blue-200",
  education: "bg-emerald-100 text-emerald-700 border-emerald-200",
  identity: "bg-rose-100 text-rose-800 border-rose-200",
};

// ── Helpers for safe access from untyped DB strings ───────────────────
export function isTopicSlug(value: string): value is TopicSlug {
  return (ALL_TOPICS as readonly string[]).includes(value);
}

export function getTopicTranslationKey(topic: string | null | undefined): `topics.${TopicSlug}` | null {
  if (!topic || !isTopicSlug(topic)) {
    return null;
  }

  return TOPIC_TRANSLATION_KEYS[topic];
}

export function getTopicBadgeColor(topic: string | null | undefined): string {
  if (!topic || !isTopicSlug(topic)) return "bg-stone-100 text-stone-600";
  return TOPIC_BADGE_COLORS[topic];
}
