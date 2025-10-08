"use node";

import { HTTPFetchError, messagingApi, validateSignature } from "@line/bot-sdk";
import { v } from "convex/values";
import { env } from "../../env";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, internalAction } from "../_generated/server";

const { MessagingApiClient } = messagingApi;

let cachedMessagingClient: InstanceType<typeof MessagingApiClient> | null = null;

const getMessagingClient = () => {
  if (cachedMessagingClient) {
    return cachedMessagingClient;
  }

  cachedMessagingClient = new MessagingApiClient({
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
  });
  return cachedMessagingClient;
};

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
    const client = getMessagingClient();
    const timestamp = Date.now();

    const messageId: Id<"messages"> = await ctx.runMutation(
      internal.line.messages.createOutgoingTextMessage,
      {
        lineUserId,
        text,
        timestamp,
      },
    );

    try {
      await client.pushMessage({
        to: lineUserId,
        messages: [{ type: "text", text }],
      });

      await ctx.runMutation(internal.line.messages.updateMessageStatus, {
        messageId,
        status: "sent",
      });

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      let errorMessage: string | undefined;
      if (error instanceof HTTPFetchError) {
        errorMessage = error.body;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      await ctx.runMutation(internal.line.messages.updateMessageStatus, {
        messageId,
        status: "failed",
        errorMessage,
      });

      throw error;
    }
  },
});
