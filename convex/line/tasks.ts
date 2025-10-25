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
    const attempts = await ctx.runQuery(internal.line.message_deliveries.listRetryableAttempts, {
      now,
      limit: take,
    });

    for (const attempt of attempts) {
      const message = await ctx.runQuery(internal.line.messages.getMessageById, {
        messageId: attempt.messageId,
      });

      if (!message || message.direction !== "outgoing") {
        continue;
      }

      const content =
        message.content ??
        ("text" in message ? { kind: "text" as const, text: message.text ?? "" } : undefined);

      if (!content || content.kind !== "text") {
        console.warn("retryFailedMessages: unsupported content kind", content?.kind ?? "unknown");
        continue;
      }

      try {
        await deliverTextMessage({
          ctx,
          messageId: message._id,
          lineUserId: message.lineUserId,
          text: content.text,
          isRedelivery: true,
          retryStrategy: "backoff",
        });
      } catch (error) {
        // 連続失敗はログに残し、次のスケジュールで再挑戦させる
        console.error("Failed to retry message", message._id, (error as Error).message);
      }
    }
  },
});
