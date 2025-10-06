import type { FollowEvent, UnfollowEvent, WebhookEvent, WebhookRequestBody } from "@line/bot-sdk";
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

    if (event.type === "message" && event.message.type === "text") {
      if (!event.source.userId) {
        continue;
      }
      await ctx.runMutation(internal.line.messages.persistIncomingTextMessage, {
        lineUserId: event.source.userId,
        lineMessageId: event.message.id,
        text: event.message.text,
        replyToken: event.replyToken,
        timestamp: event.timestamp,
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
      await ctx.runMutation(internal.line.events.applyEventToUserState, {
        lineUserId,
        eventType: unfollowEvent.type,
        eventTimestamp: unfollowEvent.timestamp,
        mode: unfollowEvent.mode,
        isRedelivery: unfollowEvent.deliveryContext?.isRedelivery,
      });
    }
  }
  return new Response("ok", { status: 200 });
});
