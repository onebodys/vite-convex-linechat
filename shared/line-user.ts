import { z } from "zod/v4";

export const lineUserSummarySchema = z.looseObject({
  lineUserId: z.string(),
  displayName: z.string().optional().nullable(),
  pictureUrl: z.url().optional().nullable(),
  statusMessage: z.string().optional().nullable(),
  lastMessageText: z.string().optional().nullable(),
  lastMessageDirection: z
    .union([z.literal("incoming"), z.literal("outgoing")])
    .optional()
    .nullable(),
  lastEventType: z.string().optional().nullable(),
  lastEventAt: z.number().optional().nullable(),
  relationshipStatus: z.union([z.literal("following"), z.literal("blocked"), z.literal("unknown")]),
  channelMode: z.union([z.literal("active"), z.literal("standby"), z.literal("unknown")]),
  lastFollowedAt: z.number().optional().nullable(),
  lastUnblockedAt: z.number().optional().nullable(),
  blockedAt: z.number().optional().nullable(),
  updatedAt: z.number(),
  isRedelivery: z.boolean().optional().nullable(),
});

export type LineUserSummary = z.infer<typeof lineUserSummarySchema>;
