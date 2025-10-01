import type { WebhookRequestBody } from "@line/bot-sdk";
import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

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

  console.log(body);

  const { events = [] } = JSON.parse(body) as WebhookRequestBody;

  for (const event of events) {
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
    }
  }
  return new Response("ok", { status: 200 });
});
