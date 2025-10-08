import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";

export const persistIncomingTextMessage = internalMutation({
  args: {
    lineUserId: v.string(),
    lineMessageId: v.string(),
    text: v.string(),
    replyToken: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      lineUserId: args.lineUserId,
      direction: "incoming",
      text: args.text,
      status: "sent",
      lineMessageId: args.lineMessageId,
      replyToken: args.replyToken,
      createdAt: args.timestamp,
    });
  },
});

export const createOutgoingTextMessage = internalMutation({
  args: {
    lineUserId: v.string(),
    text: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      lineUserId: args.lineUserId,
      direction: "outgoing",
      text: args.text,
      status: "pending",
      createdAt: args.timestamp,
    });

    return messageId;
  },
});

export const updateMessageStatus = internalMutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, { messageId, status, errorMessage }) => {
    await ctx.db.patch(messageId, {
      status,
      errorMessage,
    });
  },
});

export const listByLineUser = query({
  args: {
    lineUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { lineUserId, limit }) => {
    const take = Math.min(Math.max(limit ?? 100, 1), 500);
    const docs = await ctx.db
      .query("messages")
      .withIndex("byUserCreatedAt", (q) => q.eq("lineUserId", lineUserId))
      .order("desc")
      .take(take);

    return docs.reverse();
  },
});
