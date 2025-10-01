"use node";

import { validateSignature } from "@line/bot-sdk";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";

export const doValidateSignature = internalAction({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  handler: async (_ctx, { body, signature }) => {
    const channelSecret = process.env.LINE_CHANNEL_SECRET;
    if (!channelSecret) {
      throw new Error("Missing LINE_CHANNEL_SECRET env var");
    }
    return validateSignature(body, channelSecret, signature);
  },
});
