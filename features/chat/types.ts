import { z } from "zod";

import { recommendationCardSchema } from "@/features/recommendations/types";
import {
  CHAT_HISTORY_LIMIT,
  CHAT_MAX_INPUT_LENGTH,
  CHAT_TOPICS,
} from "@/features/chat/constants";

export const chatRoleSchema = z.enum(["system", "user", "assistant"]);
export const chatTopicSchema = z.enum(CHAT_TOPICS);

export const chatMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  role: chatRoleSchema,
  content: z.string(),
  createdAt: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const chatSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  startedAt: z.string(),
  activeTopic: chatTopicSchema.nullable(),
  messageCount: z.number().int().nonnegative(),
  freeMessagesUsed: z.number().int().nonnegative(),
  hitPaywall: z.boolean(),
});

export const chatTurnRequestSchema = z.object({
  sessionId: z.string().min(1).optional(),
  message: z.string().trim().min(1).max(CHAT_MAX_INPUT_LENGTH),
  clientMessageId: z.string().min(1).optional(),
});

export const chatUsagePolicySchema = z.object({
  allowed: z.boolean(),
  requiresUpgrade: z.boolean(),
  requires_upgrade: z.boolean(),
  reason: z.string().nullable(),
  remainingTurns: z.number().int().nonnegative().nullable(),
});

export const chatContextSchema = z.object({
  sessionId: z.string(),
  systemPrompt: z.string(),
  recentMessages: z.array(chatMessageSchema).max(CHAT_HISTORY_LIMIT),
  activeTopic: chatTopicSchema.nullable(),
  userStateSummary: z.string().nullable(),
  topic: z.string().optional(),
  turnCount: z.number().int().nonnegative().optional(),
  isPlusUser: z.boolean().optional(),
});

export const chatUserStateUpdateSchema = z.object({
  shouldPersist: z.boolean(),
  summary: z.string().nullable(),
});

export const chatTurnResponseSchema = z.object({
  session: chatSessionSchema,
  reply: chatMessageSchema,
  messages: z.array(chatMessageSchema),
  recommendation: recommendationCardSchema.nullable(),
  usage: chatUsagePolicySchema,
});

export type ChatRole = z.infer<typeof chatRoleSchema>;
export type ChatTopic = z.infer<typeof chatTopicSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatSession = z.infer<typeof chatSessionSchema>;
export type ChatTurnRequest = z.infer<typeof chatTurnRequestSchema>;
export type ChatUsagePolicy = z.infer<typeof chatUsagePolicySchema>;
export type ChatContext = z.infer<typeof chatContextSchema>;
export type ChatUserStateUpdate = z.infer<typeof chatUserStateUpdateSchema>;
export type ChatTurnResponse = z.infer<typeof chatTurnResponseSchema>;