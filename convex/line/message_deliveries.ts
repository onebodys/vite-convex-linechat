import { v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { retryStrategy } from "../lib/message_model";

export const createDeliveryAttempt = internalMutation({
  args: {
    messageId: v.id("messages"),
    requestedAt: v.number(),
    retryStrategy: v.optional(retryStrategy),
  },
  handler: async (ctx, args) => {
    const latest = await ctx.db
      .query("messageDeliveries")
      .withIndex("byMessageAttempt", (q) => q.eq("messageId", args.messageId))
      .order("desc")
      .first();

    const attempt = (latest?.attempt ?? 0) + 1;
    const deliveryAttemptId = await ctx.db.insert("messageDeliveries", {
      messageId: args.messageId,
      attempt,
      requestedAt: args.requestedAt,
      status: "pending",
      retryStrategy: args.retryStrategy ?? "immediate",
    });

    return {
      deliveryAttemptId,
      attempt,
    } as const;
  },
});

export const completeDeliveryAttempt = internalMutation({
  args: {
    deliveryAttemptId: v.id("messageDeliveries"),
    status: v.union(v.literal("success"), v.literal("failed")),
    completedAt: v.number(),
    errorMessage: v.optional(v.string()),
    responseStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    nextRetryAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      status: args.status,
      completedAt: args.completedAt,
    };

    if (args.errorMessage !== undefined) {
      patch.errorMessage = args.errorMessage;
    }

    if (args.responseStatus !== undefined) {
      patch.responseStatus = args.responseStatus;
    }

    if (args.responseBody !== undefined) {
      patch.responseBody = args.responseBody;
    }

    if (args.nextRetryAt !== undefined) {
      patch.nextRetryAt = args.nextRetryAt;
    }

    await ctx.db.patch(args.deliveryAttemptId, patch);
  },
});

export const listRetryableAttempts = internalQuery({
  args: {
    now: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { now, limit }) => {
    const take = Math.min(Math.max(limit ?? 10, 1), 50);
    const candidates = await ctx.db
      .query("messageDeliveries")
      .withIndex("byStatusNextRetry", (q) => q.eq("status", "failed").lte("nextRetryAt", now))
      .order("asc")
      .take(take * 2);

    const results = [];

    for (const attempt of candidates) {
      const latest = await ctx.db
        .query("messageDeliveries")
        .withIndex("byMessageAttempt", (q) => q.eq("messageId", attempt.messageId))
        .order("desc")
        .first();

      if (!latest || latest._id !== attempt._id) {
        continue;
      }

      results.push(attempt);

      if (results.length >= take) {
        break;
      }
    }

    return results;
  },
});
