import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "../_generated/server";

const messageStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("canceled"),
);

const messageDeliveryState = v.union(v.literal("queued"), v.literal("delivering"));

const mediaContentType = v.union(
  v.literal("image"),
  v.literal("video"),
  v.literal("audio"),
  v.literal("file"),
  v.literal("sticker"),
);

const messageContent = v.union(
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

const nullableDeliveryState = v.union(messageDeliveryState, v.null());
const nullableString = v.union(v.string(), v.null());

/**
 * @description LINEから受信したメッセージをcontentフォーマットで保存する共通ミューテーション。
 */
export const persistIncomingMessage = internalMutation({
  args: {
    lineUserId: v.string(),
    lineMessageId: v.optional(v.string()),
    content: messageContent,
    replyToken: v.optional(v.string()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      lineUserId: args.lineUserId,
      direction: "incoming",
      content: args.content,
      status: "sent",
      lineMessageId: args.lineMessageId ?? undefined,
      replyToken: args.replyToken,
      createdAt: args.timestamp,
      updatedAt: args.timestamp,
    });
  },
});

/**
 * @description オペレーターが送信したテキストメッセージの下書きを作成し、配送処理に渡す。
 */
export const createOutgoingTextMessage = internalMutation({
  args: {
    lineUserId: v.string(),
    text: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("messages", {
      lineUserId: args.lineUserId,
      direction: "outgoing",
      content: {
        kind: "text",
        text: args.text,
      },
      status: "pending",
      deliveryState: "queued",
      createdAt: args.timestamp,
      updatedAt: args.timestamp,
    });

    return messageId;
  },
});

/**
 * @description メッセージの配信状態やLINE固有IDを更新し、UIへ最新情報を反映させる。
 */
export const updateMessageLifecycle = internalMutation({
  args: {
    messageId: v.id("messages"),
    status: v.optional(messageStatus),
    deliveryState: v.optional(nullableDeliveryState),
    lineMessageId: v.optional(nullableString),
    replyToken: v.optional(nullableString),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { updatedAt: args.updatedAt };

    if (args.status !== undefined) {
      patch.status = args.status;
    }

    if (args.deliveryState !== undefined) {
      patch.deliveryState = args.deliveryState ?? undefined;
    }

    if (args.lineMessageId !== undefined) {
      patch.lineMessageId = args.lineMessageId ?? undefined;
    }

    if (args.replyToken !== undefined) {
      patch.replyToken = args.replyToken ?? undefined;
    }

    await ctx.db.patch(args.messageId, patch);
  },
});

/**
 * @description 指定ユーザーの最新メッセージを時系列順で取得するクエリ。
 */
export const listByLineUser = query({
  args: {
    lineUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { lineUserId, limit }) => {
    const take = Math.min(Math.max(limit ?? 100, 1), 500);
    const docs = await ctx.db
      .query("messages")
      .withIndex("byUserCreatedAt", (q) => q.eq("lineUserId", lineUserId))
      .order("desc")
      .take(take);

    return docs.reverse();
  },
});

/**
 * @description メッセージIDから単一ドキュメントを取得する内部クエリ。
 */
export const getMessageById = internalQuery({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, { messageId }) => {
    return ctx.db.get(messageId);
  },
});

/**
 * @description タイムライン表示向けにメッセージと添付メディアURLを返すクエリ。
 */
export const listTimelineByLineUser = query({
  args: {
    lineUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { lineUserId, limit }) => {
    const take = Math.min(Math.max(limit ?? 100, 1), 500);
    const docs = await ctx.db
      .query("messages")
      .withIndex("byUserCreatedAt", (q) => q.eq("lineUserId", lineUserId))
      .order("desc")
      .take(take);

    const ordered = docs.reverse();

    const timeline = await Promise.all(
      ordered.map(async (doc) => {
        let media:
          | {
              mediaType: "image" | "video" | "audio" | "file" | "sticker";
              url?: string;
              fileName?: string;
              mimeType?: string;
              sizeBytes?: number;
            }
          | undefined;

        if (doc.content.kind === "media") {
          const url = doc.content.storageId
            ? await ctx.storage.getUrl(doc.content.storageId)
            : undefined;

          media = {
            mediaType: doc.content.mediaType,
            url: url ?? undefined,
            fileName: doc.content.fileName,
            mimeType: doc.content.mimeType,
            sizeBytes: doc.content.sizeBytes,
          };
        }

        return {
          message: doc,
          media,
        };
      }),
    );

    return timeline;
  },
});
