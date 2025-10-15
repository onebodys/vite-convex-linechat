"use node";

import { messagingApi } from "@line/bot-sdk";
import { env } from "../../env";

const { MessagingApiClient } = messagingApi;

let cachedMessagingClient: InstanceType<typeof MessagingApiClient> | null = null;

export const getMessagingClient = () => {
  if (cachedMessagingClient) {
    return cachedMessagingClient;
  }

  cachedMessagingClient = new MessagingApiClient({
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
  });

  return cachedMessagingClient;
};
