import { z } from "zod";

import { CHAT_TOPICS } from "@/features/chat/constants";
import {
  RECOMMENDATION_CONTENT_LIMIT,
  RECOMMENDATION_PRODUCT_LIMIT,
  RECOMMENDATION_SURFACES,
} from "@/features/recommendations/constants";

export const recommendationSurfaceSchema = z.enum(RECOMMENDATION_SURFACES);

export const contentRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  href: z.string(),
  score: z.number(),
});

export const productRecommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  href: z.string(),
  score: z.number(),
});

export const recommendationRequestSchema = z.object({
  userId: z.string(),
  surface: recommendationSurfaceSchema,
  context: z.record(z.string(), z.unknown()).default({}),
});

export const recommendationChoiceSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(["content", "product"]),
  rationale: z.string(),
});

export const recommendationCardSchema = z.object({
  id: z.string(),
  kind: z.enum(["content", "product"]),
  title: z.string(),
  description: z.string(),
  href: z.string(),
  logId: z.string().nullable(),
  rationale: z.string(),
  score: z.number(),
});

export const recommendationLogInputSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  surface: recommendationSurfaceSchema,
  itemId: z.string(),
  itemType: z.enum(["content", "product"]),
  activeTopic: z.enum(CHAT_TOPICS).nullable(),
  score: z.number(),
});

export const recommendationClickInputSchema = z.object({
  logId: z.string().uuid(),
});

export const recommendationLogResultSchema = z.object({
  logged: z.boolean(),
  logId: z.string().uuid().nullable(),
  clickedAt: z.string().nullable().optional(),
  loggedAt: z.string(),
});

export const contentRecommendationListSchema = z.array(contentRecommendationSchema).max(
  RECOMMENDATION_CONTENT_LIMIT,
);

export const productRecommendationListSchema = z.array(productRecommendationSchema).max(
  RECOMMENDATION_PRODUCT_LIMIT,
);

export type RecommendationSurface = z.infer<typeof recommendationSurfaceSchema>;
export type ContentRecommendation = z.infer<typeof contentRecommendationSchema>;
export type ProductRecommendation = z.infer<typeof productRecommendationSchema>;
export type RecommendationRequest = z.infer<typeof recommendationRequestSchema>;
export type RecommendationChoice = z.infer<typeof recommendationChoiceSchema>;
export type RecommendationCard = z.infer<typeof recommendationCardSchema>;
export type RecommendationLogInput = z.infer<typeof recommendationLogInputSchema>;
export type RecommendationClickInput = z.infer<typeof recommendationClickInputSchema>;
export type RecommendationLogResult = z.infer<typeof recommendationLogResultSchema>;