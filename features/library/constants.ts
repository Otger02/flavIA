export const LIBRARY_TOPIC_TAGS = [
  "desire",
  "communication",
  "couple_connection",
  "jealousy",
  "boundaries",
  "pleasure",
  "self_connection",
  "routine",
] as const;

export const LIBRARY_INTENT_TAGS = [
  "understanding",
  "practical_ideas",
  "expression",
  "reflection",
  "reconnection",
  "exploration",
] as const;

export const LIBRARY_CONTENT_TYPES = ["article", "audio", "guide", "faq", "script", "video"] as const;

export const LIBRARY_DOCUMENT_TYPES = ["article", "audio", "guide", "faq", "script", "video"] as const;

export type LibraryTopicTag = (typeof LIBRARY_TOPIC_TAGS)[number];
export type LibraryIntentTag = (typeof LIBRARY_INTENT_TAGS)[number];
export type LibraryContentType = (typeof LIBRARY_CONTENT_TYPES)[number];