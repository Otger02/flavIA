export const CHAT_API_ROUTE = "/api/chat";
export const CHAT_DEFAULT_MODEL = "provider-to-be-selected";
export const CHAT_MAX_INPUT_LENGTH = 4_000;
export const CHAT_HISTORY_LIMIT = 20;
export const CHAT_TOPICS = [
  "desire",
  "couple_connection",
  "self_connection",
  "communication",
  "body_confidence",
  "routine",
  "curiosity",
] as const;
export const CHAT_DEFAULT_SYSTEM_PROMPT =
  "You are Flavia, a conversational wellbeing assistant. The final behavior will be defined later.";