"use node";

import { HTTPFetchError, validateSignature } from "@line/bot-sdk";
import { v } from "convex/values";
import { env } from "../../env";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, internalAction } from "../_generated/server";
import { deliverTextMessage } from "./message_delivery";
import { getMessagingClient } from "./messaging_client";

export const doValidateSignature = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (_ctx, { body, signature }) => {
    return validateSignature(body, env.LINE_CHANNEL_SECRET, signature);
  },
});

export const fetchUserProfile = internalAction({
  args: {
    lineUserId: v.string(),
  },
  handler: async (_ctx, { lineUserId }) => {
    const client = getMessagingClient();

    try {
      const profile = await client.getProfile(lineUserId);
      return {
        success: true as const,
        status: 200,
        profile: {
          displayName: profile.displayName ?? undefined,
          pictureUrl: profile.pictureUrl ?? undefined,
          statusMessage: profile.statusMessage ?? undefined,
          language: profile.language ?? undefined,
        },
      };
    } catch (error) {
      if (error instanceof HTTPFetchError) {
        return {
          success: false as const,
          status: error.status,
          error: error.body,
        };
      }

      console.error("Unexpected error while fetching LINE profile", error);
      return {
        success: false as const,
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

type SendTextMessageResult = { success: true; messageId: Id<"messages"> };

export const sendTextMessage = action({
  args: {
    lineUserId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, { lineUserId, text }): Promise<SendTextMessageResult> => {
    const timestamp = Date.now();

    const messageId: Id<"messages"> = await ctx.runMutation(
      internal.line.messages.createOutgoingTextMessage,
      {
        lineUserId,
        text,
        timestamp,
      },
    );

    await deliverTextMessage({
      ctx,
      messageId,
      lineUserId,
      text,
      isRetry: false,
      currentRetryCount: 0,
    });

    return {
      success: true,
      messageId,
    };
  },
});

export const resendTextMessage = action({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, { messageId }) => {
    const message = await ctx.runQuery(internal.line.messages.getMessageById, { messageId });

    if (!message) {
      throw new Error("Message not found");
    }

    if (message.direction !== "outgoing") {
      throw new Error("Only outgoing messages can be resent");
    }

    if (message.status !== "failed") {
      throw new Error("Message is not in a failed state");
    }

    await deliverTextMessage({
      ctx,
      messageId,
      lineUserId: message.lineUserId,
      text: message.text,
      isRetry: true,
      currentRetryCount: message.retryCount ?? 0,
    });

    return { success: true } as const;
  },
});
