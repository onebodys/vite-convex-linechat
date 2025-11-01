import { type Infer, v } from "convex/values";

const MESSAGE_SUMMARY_MAX_LENGTH = 140;

export const messageStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("canceled"),
);

export const messageDeliveryState = v.union(v.literal("queued"), v.literal("delivering"));

export const mediaContentType = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("file"),
  v.literal("sticker"),
);

export const messageContent = v.union(
  v.object({
    kind: v.literal("text"),
    text: v.string(),
  }),
  v.object({
    kind: v.literal("media"),
    mediaType: mediaContentType,
    lineContentId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    previewStorageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  }),
  v.object({
    kind: v.literal("template"),
    templateType: v.string(),
    altText: v.string(),
    payload: v.string(),
  }),
);

export const quotedMessageInfo = v.object({
  lineMessageId: v.optional(v.string()),
  displayName: v.optional(v.string()),
  text: v.optional(v.string()),
  messageType: v.optional(v.string()),
});

export const retryStrategy = v.union(
  v.literal("immediate"),
  v.literal("backoff"),
  v.literal("manual"),
);

export const deliveryStatusSnapshot = v.union(
  v.literal("pending"),
  v.literal("success"),
  v.literal("failed"),
);

export type MessageStatus = Infer<typeof messageStatus>;
export type MessageDeliveryState = Infer<typeof messageDeliveryState>;
export type MediaContentType = Infer<typeof mediaContentType>;
export type MessageContent = Infer<typeof messageContent>;
export type QuotedMessageInfo = Infer<typeof quotedMessageInfo>;
export type RetryStrategy = Infer<typeof retryStrategy>;
export type DeliveryStatusSnapshot = Infer<typeof deliveryStatusSnapshot>;

/**
 * @description メッセージ本文からサマリ文字列を生成する。UIやログで使用する短いプレビューを返す。
 */
export function createMessageSummary(content: MessageContent, fallback = "[メッセージ]") {
  const summary = (() => {
    if (content.kind === "text") {
      return content.text.trim();
    }
    if (content.kind === "template") {
      return content.altText.trim();
    }
    const label = content.fileName ?? content.mediaType.toUpperCase();
    return `[${label}]`;
  })();

  if (!summary) {
    return fallback;
  }

  return summary.length > MESSAGE_SUMMARY_MAX_LENGTH
    ? summary.slice(0, MESSAGE_SUMMARY_MAX_LENGTH)
    : summary;
}

export const messageSummaryMaxLength = MESSAGE_SUMMARY_MAX_LENGTH;
