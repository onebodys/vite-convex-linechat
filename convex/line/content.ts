"use node";

import { HTTPFetchError } from "@line/bot-sdk";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { getMessagingBlobClient } from "./messaging_client";

const mediaType = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("file"),
);

/**
 * @description LINEのメッセージコンテンツを取得してConvex Storageへ格納する内部アクション。
 */
export const fetchAndStoreMessageContent = internalAction({
  args: {
    lineMessageId: v.string(),
    mediaType,
    fileName: v.optional(v.string()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, { lineMessageId, mediaType: type, mimeType }) => {
    const client = getMessagingBlobClient();

    try {
      const readable = await client.getMessageContent(lineMessageId);
      const chunks: Buffer[] = [];

      for await (const chunk of readable) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      const buffer = Buffer.concat(chunks);
      const blob = new Blob([buffer], {
        type: mimeType ?? "application/octet-stream",
      });

      const storageId = await ctx.storage.store(blob);

      return {
        storageId,
        sizeBytes: buffer.length,
        mediaType: type,
        mimeType: blob.type,
      } as const;
    } catch (error) {
      if (error instanceof HTTPFetchError) {
        throw new Error(`LINE media fetch failed: ${error.status}`);
      }
      throw error;
    }
  },
});
