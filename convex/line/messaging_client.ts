"use node";

import { messagingApi } from "@line/bot-sdk";
import { env } from "../../env";

const { MessagingApiClient, MessagingApiBlobClient } = messagingApi;

let cachedMessagingClient: InstanceType<typeof MessagingApiClient> | null = null;
let cachedBlobClient: InstanceType<typeof MessagingApiBlobClient> | null = null;

/**
 * @description Messaging APIのJSONエンドポイントにアクセスするクライアントを返す。
 */
export const getMessagingClient = () => {
  if (cachedMessagingClient) {
    return cachedMessagingClient;
  }

  cachedMessagingClient = new MessagingApiClient({
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
  });

  return cachedMessagingClient;
};

/**
 * @description 画像や動画などバイナリコンテンツを取得するためのBlobクライアントを返す。
 */
export const getMessagingBlobClient = () => {
  if (cachedBlobClient) {
    return cachedBlobClient;
  }

  cachedBlobClient = new MessagingApiBlobClient({
    channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
  });

  return cachedBlobClient;
};
