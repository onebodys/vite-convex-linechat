"use node";

import { HTTPFetchError } from "@line/bot-sdk";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { getMessagingClient } from "./messaging_client";

type RetryStrategy = "immediate" | "backoff" | "manual";

type DeliverTextMessageParams = {
  ctx: ActionCtx;
  messageId: Id<"messages">;
  lineUserId: string;
  text: string;
  isRedelivery: boolean;
  retryStrategy: RetryStrategy;
};

// LINE API 再送間隔の最小値と上限（指数バックオフ）
const BASE_BACKOFF_MS = 30_000;
const MAX_BACKOFF_MS = 5 * 60_000;

// 次回リトライ時刻を計算する（指数バックオフ + 上限）
const computeNextRetry = (attempts: number, now: number) => {
  const exponent = Math.max(attempts - 1, 0);
  const delay = Math.min(BASE_BACKOFF_MS * 2 ** exponent, MAX_BACKOFF_MS);
  return now + delay;
};

const clampSummary = (value: string, max = 140) =>
  value.length > max ? value.slice(0, max) : value;

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

    const summary = clampSummary(text);

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
      payloadSummary: clampSummary(text),
      deliveryStatusSnapshot: "failed",
      errorMessage,
      nextRetryAt,
      isRedelivery,
    });

    throw rawError;
  }
}
