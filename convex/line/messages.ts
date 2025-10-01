import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

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
