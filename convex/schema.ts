import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const messageStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
);

const messageDirection = v.union(
  v.literal("incoming"),
  v.literal("outgoing"),
);

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
    updatedAt: v.optional(v.number()),
  })
    .index("byUserCreatedAt", ["lineUserId", "createdAt"])
    .index("byStatus", ["status"]),
});
