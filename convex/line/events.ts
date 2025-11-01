import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { deliveryStatusSnapshot } from "../lib/message_model";

const profileShape = v.object({
  displayName: v.optional(v.string()),
  pictureUrl: v.optional(v.string()),
  statusMessage: v.optional(v.string()),
  language: v.optional(v.string()),
});

type ChannelMode = "active" | "standby" | "unknown";

type RelationshipStatus = "following" | "blocked" | "unknown";

const messagePreviewType = v.union(v.literal("text"), v.literal("media"), v.literal("template"));

const normalizeMode = (mode?: string | null): ChannelMode => {
  if (mode === "active" || mode === "standby") {
    return mode;
  }
  return "unknown";
};

const normalizeRelationshipStatus = (
  eventType: string,
  current: RelationshipStatus,
): RelationshipStatus => {
  if (eventType === "follow") {
    return "following";
  }
  if (eventType === "unfollow") {
    return "blocked";
  }
  return current;
};

export const recordWebhookEvent = internalMutation({
  args: {
    webhookEventId: v.string(),
    eventType: v.string(),
    timestamp: v.number(),
    lineUserId: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    mode: v.optional(v.string()),
    isRedelivery: v.optional(v.boolean()),
    replyToken: v.optional(v.string()),
    followIsUnblocked: v.optional(v.boolean()),
    rawEvent: v.string(),
    payloadSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const channelMode = normalizeMode(args.mode);
    await ctx.db.insert("lineEvents", {
      webhookEventId: args.webhookEventId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      lineUserId: args.lineUserId,
      sourceType: args.sourceType,
      mode: channelMode,
      isRedelivery: args.isRedelivery,
      replyToken: args.replyToken,
      followIsUnblocked: args.followIsUnblocked,
      rawEvent: args.rawEvent,
      source: "webhook",
      payloadSummary: args.payloadSummary,
      createdAt: Date.now(),
    });
  },
});

export const applyEventToUserState = internalMutation({
  args: {
    lineUserId: v.string(),
    eventType: v.string(),
    eventTimestamp: v.number(),
    mode: v.optional(v.string()),
    isRedelivery: v.optional(v.boolean()),
    followIsUnblocked: v.optional(v.boolean()),
    lastMessageSummary: v.optional(v.string()),
    lastMessagePreviewType: v.optional(messagePreviewType),
    lastMessageDirection: v.optional(v.union(v.literal("incoming"), v.literal("outgoing"))),
    profile: v.optional(profileShape),
    profileFetchStatus: v.optional(v.union(v.literal("success"), v.literal("error"))),
    profileFetchStatusCode: v.optional(v.number()),
    profileFetchError: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const channelMode = normalizeMode(args.mode);
    const now = Date.now();

    const existing = await ctx.db
      .query("lineUserStates")
      .withIndex("byLineUserId", (q) => q.eq("lineUserId", args.lineUserId))
      .first();

    const nextRelationship = normalizeRelationshipStatus(
      args.eventType,
      (existing?.relationshipStatus as RelationshipStatus | undefined) ?? "unknown",
    );

    const updates: Record<string, unknown> = {
      relationshipStatus: nextRelationship,
      channelMode,
      isRedelivery: args.isRedelivery,
      lastEventType: args.eventType,
      lastEventAt: args.eventTimestamp,
      updatedAt: now,
    };

    if (args.lastMessageSummary !== undefined) {
      updates.lastMessageSummary = args.lastMessageSummary;
    }

    if (args.lastMessagePreviewType !== undefined) {
      updates.lastMessagePreviewType = args.lastMessagePreviewType;
    }

    if (args.lastMessageDirection !== undefined) {
      updates.lastMessageDirection = args.lastMessageDirection;
    }

    if (args.eventType === "follow") {
      updates.lastFollowedAt = args.eventTimestamp;
      updates.blockedAt = undefined;
      if (args.followIsUnblocked) {
        updates.lastUnblockedAt = args.eventTimestamp;
      }
    }

    if (args.eventType === "unfollow") {
      updates.blockedAt = args.eventTimestamp;
    }

    if (args.profile) {
      updates.displayName = args.profile.displayName;
      updates.pictureUrl = args.profile.pictureUrl;
      updates.statusMessage = args.profile.statusMessage;
      updates.language = args.profile.language;
      updates.profileFetchedAt = now;
    }

    if (args.profileFetchStatus) {
      updates.profileFetchStatus = args.profileFetchStatus;
      updates.profileFetchStatusCode = args.profileFetchStatusCode;
      updates.profileFetchError =
        args.profileFetchStatus === "error" ? args.profileFetchError : undefined;
    }

    if (!existing) {
      await ctx.db.insert("lineUserStates", {
        lineUserId: args.lineUserId,
        relationshipStatus: updates.relationshipStatus as RelationshipStatus,
        channelMode,
        isRedelivery: updates.isRedelivery as boolean | undefined,
        lastEventType: args.eventType,
        lastEventAt: args.eventTimestamp,
        lastMessageSummary: args.lastMessageSummary,
        lastMessagePreviewType: args.lastMessagePreviewType,
        lastMessageDirection: args.lastMessageDirection,
        lastFollowedAt: updates.lastFollowedAt as number | undefined,
        lastUnblockedAt: updates.lastUnblockedAt as number | undefined,
        blockedAt: updates.blockedAt as number | undefined,
        displayName: updates.displayName as string | undefined,
        pictureUrl: updates.pictureUrl as string | undefined,
        statusMessage: updates.statusMessage as string | undefined,
        language: updates.language as string | undefined,
        profileFetchedAt: updates.profileFetchedAt as number | undefined,
        profileFetchStatus: updates.profileFetchStatus as "success" | "error" | undefined,
        profileFetchStatusCode: updates.profileFetchStatusCode as number | undefined,
        profileFetchError: updates.profileFetchError as string | undefined,
        updatedAt: now,
      });
      return;
    }

    await ctx.db.patch(existing._id, updates);
  },
});

export const recordPushEvent = internalMutation({
  args: {
    messageId: v.id("messages"),
    deliveryAttemptId: v.id("messageDeliveries"),
    attempt: v.number(),
    eventType: v.string(),
    timestamp: v.number(),
    lineUserId: v.optional(v.string()),
    payloadSummary: v.optional(v.string()),
    deliveryStatusSnapshot: v.optional(deliveryStatusSnapshot),
    errorMessage: v.optional(v.string()),
    nextRetryAt: v.optional(v.number()),
    isRedelivery: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rawEvent = {
      kind: "push",
      eventType: args.eventType,
      attempt: args.attempt,
      messageId: args.messageId,
      deliveryAttemptId: args.deliveryAttemptId,
      lineUserId: args.lineUserId,
      errorMessage: args.errorMessage,
      nextRetryAt: args.nextRetryAt,
    };

    const webhookEventId = `push:${args.messageId}:${args.attempt}:${args.timestamp}`;

    await ctx.db.insert("lineEvents", {
      webhookEventId,
      eventType: args.eventType,
      timestamp: args.timestamp,
      lineUserId: args.lineUserId,
      sourceType: "bot",
      mode: "active",
      isRedelivery: args.isRedelivery,
      rawEvent: JSON.stringify(rawEvent),
      source: "push",
      messageId: args.messageId,
      deliveryAttemptId: args.deliveryAttemptId,
      deliveryStatusSnapshot: args.deliveryStatusSnapshot,
      payloadSummary: args.payloadSummary,
      createdAt: Date.now(),
    });
  },
});
