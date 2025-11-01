"use node";

import { HTTPFetchError } from "@line/bot-sdk";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import type { RetryStrategy } from "../lib/message_model";
import { computeNextRetry, summarizeTextBody } from "./message_helpers";
import { getMessagingClient } from "./messaging_client";

type DeliverTextMessageParams = {
  ctx: ActionCtx;
  messageId: Id<"messages">;
  lineUserId: string;
  text: string;
  isRedelivery: boolean;
  retryStrategy: RetryStrategy;
};

export async function deliverTextMessage({
  ctx,
  messageId,
  lineUserId,
  text,
  isRedelivery,
  retryStrategy,
}: DeliverTextMessageParams) {
  const attemptTimestamp = Date.now();
  const client = getMessagingClient();

  const { deliveryAttemptId, attempt } = await ctx.runMutation(
    internal.line.message_deliveries.createDeliveryAttempt,
    {
      messageId,
      requestedAt: attemptTimestamp,
      retryStrategy,
    },
  );

  await ctx.runMutation(internal.line.messages.updateMessageLifecycle, {
    messageId,
    status: "pending",
    deliveryState: "delivering",
    updatedAt: attemptTimestamp,
  });

  try {
    const response = await client.pushMessage({
      to: lineUserId,
      messages: [{ type: "text", text }],
    });

    const sent = response.sentMessages?.[0];

    await ctx.runMutation(internal.line.message_deliveries.completeDeliveryAttempt, {
      deliveryAttemptId,
      status: "success",
      completedAt: attemptTimestamp,
      responseStatus: 200,
    });

    await ctx.runMutation(internal.line.messages.updateMessageLifecycle, {
      messageId,
      status: "sent",
      deliveryState: null,
      ...(sent?.id ? { lineMessageId: sent.id } : {}),
      ...(sent?.quoteToken ? { quoteToken: sent.quoteToken } : {}),
      updatedAt: attemptTimestamp,
    });

    const summary = summarizeTextBody(text);

    await ctx.runMutation(internal.line.events.applyEventToUserState, {
      lineUserId,
      eventType: "outgoing_message",
      eventTimestamp: attemptTimestamp,
      mode: "active",
      isRedelivery,
      lastMessageSummary: summary,
      lastMessagePreviewType: "text",
      lastMessageDirection: "outgoing",
    });

    await ctx.runMutation(internal.line.events.recordPushEvent, {
      messageId,
      deliveryAttemptId,
      attempt,
      eventType: "push_message_success",
      timestamp: attemptTimestamp,
      lineUserId,
      payloadSummary: summary,
      deliveryStatusSnapshot: "success",
      isRedelivery,
    });
  } catch (rawError) {
    let errorMessage: string | undefined;

    if (rawError instanceof HTTPFetchError) {
      errorMessage = rawError.body;
    } else if (rawError instanceof Error) {
      errorMessage = rawError.message;
    }

    const nextRetryAt = computeNextRetry(attempt, attemptTimestamp);

    await ctx.runMutation(internal.line.message_deliveries.completeDeliveryAttempt, {
      deliveryAttemptId,
      status: "failed",
      completedAt: attemptTimestamp,
      errorMessage,
      nextRetryAt,
    });

    await ctx.runMutation(internal.line.messages.updateMessageLifecycle, {
      messageId,
      status: "failed",
      deliveryState: "queued",
      updatedAt: attemptTimestamp,
    });

    await ctx.runMutation(internal.line.events.applyEventToUserState, {
      lineUserId,
      eventType: "outgoing_message_failed",
      eventTimestamp: attemptTimestamp,
      mode: "active",
      isRedelivery,
      lastMessageDirection: "outgoing",
    });

    await ctx.runMutation(internal.line.events.recordPushEvent, {
      messageId,
      deliveryAttemptId,
      attempt,
      eventType: "push_message_failed",
      timestamp: attemptTimestamp,
      lineUserId,
      payloadSummary: summarizeTextBody(text),
      deliveryStatusSnapshot: "failed",
      errorMessage,
      nextRetryAt,
      isRedelivery,
    });

    throw rawError;
  }
}
