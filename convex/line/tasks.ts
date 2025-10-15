"use node";

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { deliverTextMessage } from "./message_delivery";

// scheduler から呼ばれ、再送条件を満たしたメッセージを順次処理する
export const retryFailedMessages = internalAction({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }) => {
    const now = Date.now();
    // Convex のクォータを守るために 50 件までに制限
    const take = Math.min(Math.max(limit ?? 10, 1), 50);
    const messages = await ctx.runQuery(internal.line.messages.listRetryableMessages, {
      now,
      limit: take,
    });

    for (const message of messages) {
      if (!message) {
        continue;
      }

      try {
        await deliverTextMessage({
          ctx,
          messageId: message._id,
          lineUserId: message.lineUserId,
          text: message.text,
          isRetry: true,
          currentRetryCount: message.retryCount ?? 0,
        });
      } catch (error) {
        // 連続失敗はログに残し、次のスケジュールで再挑戦させる
        console.error("Failed to retry message", message._id, (error as Error).message);
      }
    }
  },
});
