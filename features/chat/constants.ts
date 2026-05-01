export const CHAT_API_ROUTE = "/api/chat";
export const CHAT_DEFAULT_MODEL = "gpt-4.1-mini";
export const CHAT_MAX_INPUT_LENGTH = 4_000;
export const CHAT_HISTORY_LIMIT = 20;

// Subset of ALL_TOPICS that the chat session DB CHECK constraint accepts.
// "identity" exists in ALL_TOPICS for library taxonomy use, but the
// chat_sessions.active_topic CHECK constraint does not include it — adding
// it here would cause runtime write failures.
export const CHAT_TOPICS = [
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
] as const;
