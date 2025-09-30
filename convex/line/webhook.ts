import { internal } from "../_generated/api";
import { httpAction } from "../_generated/server";

export const webhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("x-line-signature") ?? "";
  const body = await request.text();

  const result = await ctx.runAction(internal.line.actions.verifyAndParseWebhook, {
    body,
    signature,
  });

  if (!result.valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = result.payload ?? {};
  // TODO: persist events and trigger background work here.
  console.log(payload);

  return new Response("ok", { status: 200 });
});
