import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const messageStatus = v.union(v.literal("pending"), v.literal("sent"), v.literal("failed"));

const messageDirection = v.union(v.literal("incoming"), v.literal("outgoing"));

const lineRelationshipStatus = v.union(
  v.literal("following"),
  v.literal("blocked"),
  v.literal("unknown"),
);

const lineChannelMode = v.union(v.literal("active"), v.literal("standby"), v.literal("unknown"));

export default defineSchema({
  messages: defineTable({
    lineUserId: v.string(),
    direction: messageDirection,
    text: v.string(),
    status: messageStatus,
    lineMessageId: v.optional(v.string()),
    replyToken: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("byUserCreatedAt", ["lineUserId", "createdAt"])
    .index("byStatus", ["status"]),
  lineEvents: defineTable({
    webhookEventId: v.string(),
    eventType: v.string(),
    timestamp: v.number(),
    lineUserId: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    mode: v.optional(lineChannelMode),
    isRedelivery: v.optional(v.boolean()),
    replyToken: v.optional(v.string()),
    followIsUnblocked: v.optional(v.boolean()),
    rawEvent: v.string(),
    createdAt: v.number(),
  })
    .index("byWebhookEventId", ["webhookEventId"])
    .index("byUserTimestamp", ["lineUserId", "timestamp"]),
  lineUserStates: defineTable({
    lineUserId: v.string(),
    relationshipStatus: lineRelationshipStatus,
    channelMode: lineChannelMode,
    isRedelivery: v.optional(v.boolean()),
    lastEventType: v.optional(v.string()),
    lastEventAt: v.optional(v.number()),
    lastMessageText: v.optional(v.string()),
    lastFollowedAt: v.optional(v.number()),
    lastUnblockedAt: v.optional(v.number()),
    blockedAt: v.optional(v.number()),
    displayName: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    statusMessage: v.optional(v.string()),
    language: v.optional(v.string()),
    profileFetchedAt: v.optional(v.number()),
    profileFetchStatus: v.optional(v.union(v.literal("success"), v.literal("error"))),
    profileFetchStatusCode: v.optional(v.number()),
    profileFetchError: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("byLineUserId", ["lineUserId"])
    .index("byRelationshipStatus", ["relationshipStatus"])
    .index("byUpdatedAt", ["updatedAt"]),
});
