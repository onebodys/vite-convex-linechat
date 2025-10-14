import type {
  FollowEvent,
  MessageEvent,
  UnfollowEvent,
  WebhookEvent,
  WebhookRequestBody,
} from "@line/bot-sdk";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

type FollowEventWithUnblock = FollowEvent & {
  follow?: {
    isUnblocked?: boolean;
  };
};

const extractFollowIsUnblocked = (event: FollowEvent | undefined) =>
  (event as FollowEventWithUnblock | undefined)?.follow?.isUnblocked;

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

  const { events = [] } = JSON.parse(body) as WebhookRequestBody;

  for (const event of events as WebhookEvent[]) {
    const lineUserId = event.source.type === "user" ? event.source.userId : undefined;
    const replyToken = "replyToken" in event ? event.replyToken : undefined;
    const followEvent = event.type === "follow" ? (event as FollowEvent) : undefined;
    const unfollowEvent = event.type === "unfollow" ? (event as UnfollowEvent) : undefined;

    const followIsUnblocked = extractFollowIsUnblocked(followEvent);

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
    });

    if (event.type === "message") {
      // メッセージイベントは種別ごとに処理する前に最新タイムスタンプで状態を確実に更新したい
      if (!lineUserId) {
        continue;
      }

      const messageEvent = event as MessageEvent;
      const lastMessageText =
        messageEvent.message.type === "text" ? messageEvent.message.text : undefined;

      if (messageEvent.message.type === "text") {
        // テキストメッセージは個別で保存し、以降の UI 更新に備える
        await ctx.runMutation(internal.line.messages.persistIncomingTextMessage, {
          lineUserId,
          lineMessageId: messageEvent.message.id,
          text: messageEvent.message.text,
          replyToken: messageEvent.replyToken,
          timestamp: messageEvent.timestamp,
        });
      }

      await ctx.runMutation(internal.line.events.applyEventToUserState, {
        lineUserId,
        eventType: messageEvent.type,
        eventTimestamp: messageEvent.timestamp,
        mode: messageEvent.mode,
        isRedelivery: messageEvent.deliveryContext?.isRedelivery,
        lastMessageText,
        lastMessageDirection: "incoming",
      });

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
