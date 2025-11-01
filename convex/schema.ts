import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  deliveryStatusSnapshot,
  messageContent,
  messageDeliveryState,
  messageStatus,
  quotedMessageInfo,
  retryStrategy,
} from "./lib/message_model";

const messageDirection = v.union(v.literal("incoming"), v.literal("outgoing"));

const lineRelationshipStatus = v.union(
  v.literal("following"),
  v.literal("blocked"),
  v.literal("unknown"),
);

const lineChannelMode = v.union(v.literal("active"), v.literal("standby"), v.literal("unknown"));

const deliveryAttemptStatus = v.union(
  v.literal("pending"),
  v.literal("success"),
  v.literal("failed"),
);

const eventSource = v.union(v.literal("webhook"), v.literal("push"), v.literal("system"));

const messagePreviewType = v.union(v.literal("text"), v.literal("media"), v.literal("template"));

export default defineSchema({
  messages: defineTable({
    lineUserId: v.string(),
    direction: messageDirection,
    content: messageContent,
    status: messageStatus,
    deliveryState: v.optional(messageDeliveryState),
    lineMessageId: v.optional(v.string()),
    replyToken: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    quotedMessage: v.optional(quotedMessageInfo),
    quoteToken: v.optional(v.string()),
  })
    .index("byUserCreatedAt", ["lineUserId", "createdAt"])
    .index("byLineUserDirectionCreatedAt", ["lineUserId", "direction", "createdAt"])
    .index("byStatus", ["status"])
    .index("byLineMessageId", ["lineMessageId"]),
  messageDeliveries: defineTable({
    messageId: v.id("messages"),
    attempt: v.number(),
    requestedAt: v.number(),
    completedAt: v.optional(v.number()),
    status: deliveryAttemptStatus,
    errorMessage: v.optional(v.string()),
    responseStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    nextRetryAt: v.optional(v.number()),
    retryStrategy: v.optional(retryStrategy),
  })
    .index("byMessageAttempt", ["messageId", "attempt"])
    .index("byStatusNextRetry", ["status", "nextRetryAt"]),
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
    source: eventSource,
    messageId: v.optional(v.id("messages")),
    deliveryAttemptId: v.optional(v.id("messageDeliveries")),
    deliveryStatusSnapshot: v.optional(deliveryStatusSnapshot),
    payloadSummary: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("byWebhookEventId", ["webhookEventId"])
    .index("byUserTimestamp", ["lineUserId", "timestamp"])
    .index("byMessage", ["messageId", "timestamp"]),
  lineUserStates: defineTable({
    lineUserId: v.string(),
    relationshipStatus: lineRelationshipStatus,
    channelMode: lineChannelMode,
    isRedelivery: v.optional(v.boolean()),
    lastEventType: v.optional(v.string()),
    lastEventAt: v.optional(v.number()),
    lastMessageId: v.optional(v.id("messages")),
    lastMessageSummary: v.optional(v.string()),
    lastMessagePreviewType: v.optional(messagePreviewType),
    lastMessageDirection: v.optional(messageDirection),
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
