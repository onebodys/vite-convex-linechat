import { z } from "zod/v4";
import type { Doc, Id } from "../convex/_generated/dataModel";

const messageStatusSchema = z.union([
  z.literal("pending"),
  z.literal("sent"),
  z.literal("failed"),
  z.literal("canceled"),
]);

const messageDeliveryStateSchema = z.union([z.literal("queued"), z.literal("delivering")]);

const mediaContentTypeSchema = z.union([
  z.literal("image"),
  z.literal("video"),
  z.literal("audio"),
  z.literal("file"),
  z.literal("sticker"),
]);

const messageContentSchema = z.union([
  z.object({
    kind: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    kind: z.literal("media"),
    mediaType: mediaContentTypeSchema,
    lineContentId: z.string().optional(),
    storageId: z.string().optional(),
    previewStorageId: z.string().optional(),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
    sizeBytes: z.number().optional(),
    durationMs: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  z.object({
    kind: z.literal("template"),
    templateType: z.string(),
    altText: z.string(),
    payload: z.string(),
  }),
]);

const quotedMessageSchema = z
  .object({
    lineMessageId: z.string().optional(),
    displayName: z.string().optional(),
    text: z.string().optional(),
    messageType: z.string().optional(),
  })
  .optional();

const messageDocSchema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  lineUserId: z.string(),
  direction: z.union([z.literal("incoming"), z.literal("outgoing")]),
  content: messageContentSchema,
  status: messageStatusSchema,
  deliveryState: messageDeliveryStateSchema.optional(),
  lineMessageId: z.string().optional(),
  replyToken: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  quotedMessage: quotedMessageSchema,
  quoteToken: z.string().optional(),
});

const timelineMediaSchema = z
  .object({
    mediaType: mediaContentTypeSchema,
    url: z.string().optional(),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
    sizeBytes: z.number().optional(),
  })
  .optional();

export const timelineEntrySchema = z.object({
  message: messageDocSchema,
  media: timelineMediaSchema,
});

export const timelineEntriesSchema = z.array(timelineEntrySchema);

type MessageDocInput = z.infer<typeof messageDocSchema>;
type TimelineEntryInput = z.infer<typeof timelineEntrySchema>;

type MessageDoc = Doc<"messages">;
type MessageContent = MessageDoc["content"];
type MediaContent = Extract<MessageContent, { kind: "media" }>;

export type TimelineEntry = {
  message: MessageDoc;
  media?: NonNullable<TimelineEntryInput["media"]>;
};

const normalizeMediaContent = (content: MessageDocInput["content"]): MessageContent => {
  if (content.kind !== "media") {
    return content as MessageContent;
  }

  return {
    ...content,
    storageId: content.storageId as MediaContent["storageId"],
    previewStorageId: content.previewStorageId as MediaContent["previewStorageId"],
  } as MediaContent;
};

const normalizeMessageDoc = (message: MessageDocInput): MessageDoc => {
  return {
    ...message,
    _id: message._id as Id<"messages">,
    content: normalizeMediaContent(message.content),
    deliveryState: message.deliveryState ?? undefined,
    lineMessageId: message.lineMessageId ?? undefined,
    replyToken: message.replyToken ?? undefined,
    quotedMessage: message.quotedMessage ?? undefined,
    quoteToken: message.quoteToken ?? undefined,
  };
};

/**
 * @description Convexタイムライン結果が期待形式かを確認し、型安全な配列を返す。
 */
export function parseTimelineEntries(data: unknown) {
  const parsed = timelineEntriesSchema.parse(data);
  return parsed.map<TimelineEntry>((entry) => ({
    message: normalizeMessageDoc(entry.message),
    media: entry.media ?? undefined,
  }));
}
