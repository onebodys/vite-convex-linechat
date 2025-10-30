import type {
  FollowEvent,
  MessageEvent,
  UnfollowEvent,
  WebhookEvent,
  WebhookRequestBody,
} from "@line/bot-sdk";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { httpAction } from "../_generated/server";

type FollowEventWithUnblock = FollowEvent & {
  follow?: {
    isUnblocked?: boolean;
  };
};

const extractFollowIsUnblocked = (event: FollowEvent | undefined) =>
  (event as FollowEventWithUnblock | undefined)?.follow?.isUnblocked;

const summarizeIncomingMessage = (messageEvent: MessageEvent) => {
  const { message } = messageEvent;

  if (message.type === "text") {
    return {
      summary: message.text,
      previewType: "text" as const,
    };
  }

  if (message.type === "location") {
    const alt = message.address ?? message.title ?? "[location]";
    return {
      summary: alt,
      previewType: "template" as const,
    };
  }

  const mediaTypes = new Set(["image", "video", "audio", "file", "sticker"]);

  if (mediaTypes.has(message.type)) {
    return {
      summary: `[${message.type}]`,
      previewType: "media" as const,
    };
  }

  return {
    summary: `[${message.type}]`,
    previewType: "template" as const,
  };
};

type IncomingContent =
  | {
      kind: "text";
      text: string;
    }
  | {
      kind: "media";
      mediaType: "image" | "video" | "audio" | "file" | "sticker";
      lineContentId?: string;
      storageId?: Id<"_storage">;
      previewStorageId?: Id<"_storage">;
      fileName?: string;
      mimeType?: string;
      sizeBytes?: number;
      durationMs?: number;
      width?: number;
      height?: number;
    }
  | {
      kind: "template";
      templateType: string;
      altText: string;
      payload: string;
    };

const clampSummary = (text: string | undefined, max = 140) =>
  text === undefined ? undefined : text.slice(0, max);

export const webhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("x-line-signature") ?? "";
  const body = await request.text();

  const res = await ctx.runAction(internal.line.actions.doValidateSignature, {
    body,
    signature,
  });

  if (!res) {
    return new Response("Invalid signature", { status: 401 });
  }

  /**
   * @description LINEのメッセージコンテンツを取得してConvex Storageに保存する。
   */
  const storeMediaContent = async (
    lineMessageId: string,
    mediaType: "image" | "video" | "audio" | "file",
    fileName?: string,
    mimeType?: string,
  ) => {
    return ctx.runAction(internal.line.content.fetchAndStoreMessageContent, {
      lineMessageId,
      mediaType,
      fileName,
      mimeType,
    });
  };

  /**
   * @description LINE Webhook のメッセージオブジェクトから引用情報を整形し、欠けている場合は自前の履歴で補完する。
   * LINE 側は `quotedMessage` 全体を送ってくれる場合と、`quotedMessageId` のみを送る場合があるため、
   * いったん下書き (drafted) を作ってから不足分を埋めるようにしている。
   */
  const buildQuotedMessage = async (
    message: MessageEvent["message"],
  ): Promise<
    | {
        lineMessageId?: string;
        displayName?: string;
        text?: string;
        messageType?: string;
      }
    | undefined
  > => {
    // drafted: まず LINE から渡された値だけで構成した暫定オブジェクト。
    // この段階で text/displayName が揃っていればそれを返し、未指定なら後続で履歴から補完する。
    let drafted: {
      lineMessageId?: string;
      displayName?: string;
      text?: string;
      messageType?: string;
    } | null = null;

    if ("quotedMessage" in message && message.quotedMessage) {
      const quoted = message.quotedMessage as Record<string, unknown>;
      drafted = {
        lineMessageId: typeof quoted.id === "string" ? quoted.id : undefined,
        displayName:
          typeof quoted.displayName === "string"
            ? quoted.displayName
            : typeof quoted.userId === "string"
              ? quoted.userId
              : undefined,
        text: typeof quoted.text === "string" ? quoted.text : undefined,
        messageType: typeof quoted.type === "string" ? quoted.type : undefined,
      };
    } else if ("quotedMessageId" in message && typeof message.quotedMessageId === "string") {
      drafted = {
        lineMessageId: message.quotedMessageId,
        messageType:
          "quotedMessageType" in message && typeof message.quotedMessageType === "string"
            ? message.quotedMessageType
            : undefined,
      };
    }

    // lineMessageId が無い場合は、これ以上照合できないので drafted か undefined をそのまま返す。
    if (!drafted || !drafted.lineMessageId) {
      return drafted ?? undefined;
    }

    const resolved = await ctx.runQuery(internal.line.messages.resolveQuoteByLineMessageId, {
      lineMessageId: drafted.lineMessageId,
    });

    // DB に保存済みのメッセージがあれば、本文や表示名を補完する。
    if (!resolved) {
      return drafted;
    }

    return {
      lineMessageId: drafted.lineMessageId ?? resolved.lineMessageId,
      displayName: drafted.displayName ?? resolved.displayName,
      text: drafted.text ?? resolved.text,
      messageType: drafted.messageType ?? resolved.messageType,
    };
  };

  const { events = [] } = JSON.parse(body) as WebhookRequestBody;

  for (const event of events as WebhookEvent[]) {
    const lineUserId = event.source.type === "user" ? event.source.userId : undefined;
    const replyToken = "replyToken" in event ? event.replyToken : undefined;
    const followEvent = event.type === "follow" ? (event as FollowEvent) : undefined;
    const unfollowEvent = event.type === "unfollow" ? (event as UnfollowEvent) : undefined;

    const followIsUnblocked = extractFollowIsUnblocked(followEvent);
    let payloadSummary: string | undefined;

    if (event.type === "message" && lineUserId) {
      const messageEvent = event as MessageEvent;
      let { summary: messageSummary, previewType: messagePreviewType } =
        summarizeIncomingMessage(messageEvent);
      const message = messageEvent.message;
      let content: IncomingContent;
      const quotedMessage = await buildQuotedMessage(message);

      if (message.type === "text") {
        content = {
          kind: "text",
          text: message.text,
        };
      } else if (message.type === "file") {
        const stored = await storeMediaContent(message.id, "file", message.fileName);
        content = {
          kind: "media",
          mediaType: "file",
          lineContentId: message.id,
          storageId: stored.storageId,
          sizeBytes: stored.sizeBytes ?? Number(message.fileSize),
          fileName: message.fileName,
          mimeType: stored.mimeType,
        };
        messageSummary = message.fileName;
        messagePreviewType = "media";
      } else if (message.type === "image" || message.type === "video" || message.type === "audio") {
        const provider = message.contentProvider;
        const stored =
          provider.type === "line" ? await storeMediaContent(message.id, message.type) : undefined;

        content = {
          kind: "media",
          mediaType: message.type,
          lineContentId: message.id,
          storageId: stored?.storageId,
          mimeType: stored?.mimeType,
          sizeBytes: stored?.sizeBytes,
          durationMs: message.type === "audio" ? message.duration : undefined,
        };
      } else if (message.type === "sticker") {
        content = {
          kind: "media",
          mediaType: "sticker",
          lineContentId: message.id,
          fileName: `${message.packageId}:${message.stickerId}`,
        };
        messageSummary = message.text ?? messageSummary ?? "[sticker]";
        messagePreviewType = "media";
      } else if (message.type === "location") {
        const altText = message.address ?? message.title ?? "[location]";
        content = {
          kind: "template",
          templateType: "location",
          altText,
          payload: JSON.stringify({
            title: message.title,
            address: message.address,
            latitude: message.latitude,
            longitude: message.longitude,
          }),
        };
        messageSummary = altText;
        messagePreviewType = "template";
      } else {
        const fallback = message as { type?: string };
        const altText = `[${fallback.type ?? "unknown"}]`;
        content = {
          kind: "template",
          templateType: fallback.type ?? "unknown",
          altText,
          payload: JSON.stringify(message),
        };
        messageSummary = altText;
        messagePreviewType = "template";
      }

      const clampedSummary = clampSummary(messageSummary);

      await ctx.runMutation(internal.line.messages.persistIncomingMessage, {
        lineUserId,
        lineMessageId: "id" in message ? message.id : undefined,
        content,
        replyToken,
        timestamp: messageEvent.timestamp,
        quotedMessage,
      });

      await ctx.runMutation(internal.line.events.applyEventToUserState, {
        lineUserId,
        eventType: messageEvent.type,
        eventTimestamp: messageEvent.timestamp,
        mode: messageEvent.mode,
        isRedelivery: messageEvent.deliveryContext?.isRedelivery,
        lastMessageSummary: clampedSummary,
        lastMessagePreviewType: messagePreviewType,
        lastMessageDirection: "incoming",
      });

      payloadSummary = clampedSummary;
    }

    await ctx.runMutation(internal.line.events.recordWebhookEvent, {
      webhookEventId: event.webhookEventId,
      eventType: event.type,
      timestamp: event.timestamp,
      lineUserId,
      sourceType: event.source.type,
      mode: event.mode,
      isRedelivery: event.deliveryContext?.isRedelivery,
      replyToken,
      followIsUnblocked,
      rawEvent: JSON.stringify(event),
      payloadSummary,
    });

    if (event.type === "message") {
      continue;
    }

    if (followEvent && lineUserId) {
      const profileResult = await ctx.runAction(internal.line.actions.fetchUserProfile, {
        lineUserId,
      });

      await ctx.runMutation(internal.line.events.applyEventToUserState, {
        lineUserId,
        eventType: followEvent.type,
        eventTimestamp: followEvent.timestamp,
        mode: followEvent.mode,
        isRedelivery: followEvent.deliveryContext?.isRedelivery,
        followIsUnblocked,
        profile: profileResult.success
          ? {
              displayName: profileResult.profile.displayName,
              pictureUrl: profileResult.profile.pictureUrl,
              statusMessage: profileResult.profile.statusMessage,
              language: profileResult.profile.language,
            }
          : undefined,
        profileFetchStatus: profileResult.success ? "success" : "error",
        profileFetchStatusCode: profileResult.status,
        profileFetchError: profileResult.success ? undefined : profileResult.error,
      });
      continue;
    }

    if (unfollowEvent && lineUserId) {
      // ブロックなどフォロー解除でも最終イベント時刻を更新する
      await ctx.runMutation(internal.line.events.applyEventToUserState, {
        lineUserId,
        eventType: unfollowEvent.type,
        eventTimestamp: unfollowEvent.timestamp,
        mode: unfollowEvent.mode,
        isRedelivery: unfollowEvent.deliveryContext?.isRedelivery,
      });
      continue;
    }

    if (lineUserId) {
      // 上記以外のイベントもここで網羅的に拾って最終イベント時刻をリフレッシュする
      await ctx.runMutation(internal.line.events.applyEventToUserState, {
        lineUserId,
        eventType: event.type,
        eventTimestamp: event.timestamp,
        mode: event.mode,
        isRedelivery: event.deliveryContext?.isRedelivery,
      });
    }
  }
  return new Response("ok", { status: 200 });
});
