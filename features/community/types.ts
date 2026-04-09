import type { CommunityTopic } from "./constants";

export type ThreadStatus = "published" | "hidden" | "removed";
export type CommentTargetType = "thread" | "library_item" | "story";
export type CommentStatus = "published" | "hidden" | "removed";
export type ReportReason = "spam" | "harassment" | "misinformation" | "off_topic" | "inappropriate" | "other";
export type ModerationDecision = "approved" | "flagged" | "rejected";

export type CommunityThread = {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  body: string;
  topic: CommunityTopic | null;
  is_anonymous: boolean;
  status: ThreadStatus;
  is_pinned: boolean;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  display_name?: string | null;
};

export type CommunityComment = {
  id: string;
  user_id: string;
  target_type: CommentTargetType;
  target_id: string;
  parent_comment_id: string | null;
  content: string;
  is_anonymous: boolean;
  status: CommentStatus;
  is_flavia_ai: boolean;
  created_at: string;
  updated_at: string;
  // Joined from profiles
  display_name?: string | null;
};

export type ModerationResult = {
  decision: ModerationDecision;
  confidence: number;
  reason: string | null;
};

export type CommunityUsagePolicy = {
  allowed: boolean;
  reason: string | null;
  remainingCount: number | null;
};
