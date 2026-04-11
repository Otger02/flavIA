import {
  ALL_TOPICS,
  type TopicSlug,
  TOPIC_COMMUNITY_COLORS,
} from "@/lib/topic-config";

export const COMMUNITY_TOPICS = ALL_TOPICS;

export type CommunityTopic = TopicSlug;

export const COMMUNITY_TOPIC_COLORS: Record<CommunityTopic, string> = TOPIC_COMMUNITY_COLORS;

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
