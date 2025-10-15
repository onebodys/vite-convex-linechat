"use node";

import { HTTPFetchError } from "@line/bot-sdk";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";
import { getMessagingClient } from "./messaging_client";

type DeliverTextMessageParams = {
  ctx: ActionCtx;
  messageId: Id<"messages">;
  lineUserId: string;
  text: string;
  isRetry: boolean;
  currentRetryCount: number;
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

export async function deliverTextMessage({
  ctx,
  messageId,
  lineUserId,
  text,
  isRetry,
  currentRetryCount,
}: DeliverTextMessageParams) {
  const attemptTimestamp = Date.now();
  const client = getMessagingClient();

  // 毎回送信前に pending に戻して UI を最新状態にする
  await ctx.runMutation(internal.line.messages.updateMessageStatus, {
    messageId,
    status: "pending",
    errorMessage: undefined,
    retryCount: currentRetryCount,
    nextRetryAt: undefined,
    lastAttemptAt: attemptTimestamp,
  });

  try {
    await client.pushMessage({
      to: lineUserId,
      messages: [{ type: "text", text }],
    });

    await ctx.runMutation(internal.line.messages.updateMessageStatus, {
      messageId,
      status: "sent",
      errorMessage: undefined,
      retryCount: currentRetryCount,
      nextRetryAt: undefined,
      lastAttemptAt: attemptTimestamp,
    });

    await ctx.runMutation(internal.line.events.applyEventToUserState, {
      lineUserId,
      eventType: "outgoing_message",
      eventTimestamp: attemptTimestamp,
      mode: "active",
      isRedelivery: isRetry,
      lastMessageText: text,
      lastMessageDirection: "outgoing",
    });
  } catch (rawError) {
    const nextRetryCount = currentRetryCount + 1;
    let errorMessage: string | undefined;

    if (rawError instanceof HTTPFetchError) {
      errorMessage = rawError.body;
    } else if (rawError instanceof Error) {
      errorMessage = rawError.message;
    }

    // 失敗時はエラーメッセージと次回リトライ時刻を保存
    await ctx.runMutation(internal.line.messages.updateMessageStatus, {
      messageId,
      status: "failed",
      errorMessage,
      retryCount: nextRetryCount,
      nextRetryAt: computeNextRetry(nextRetryCount, attemptTimestamp),
      lastAttemptAt: attemptTimestamp,
    });

    await ctx.runMutation(internal.line.events.applyEventToUserState, {
      lineUserId,
      eventType: "outgoing_message_failed",
      eventTimestamp: attemptTimestamp,
      mode: "active",
      isRedelivery: isRetry,
      lastMessageDirection: "outgoing",
    });

    throw rawError;
  }
}
