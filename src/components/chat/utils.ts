import type { LineUserSummary } from "../../../shared/line-user";
import { formatTimestamp } from "../../lib/datetime";
import type { Contact } from "./types";

export { formatTimestamp } from "../../lib/datetime";

export function mapLineUserToContact(user: LineUserSummary): Contact {
  const name = user.displayName ?? "LINE ユーザー";
  const avatarSeed = encodeURIComponent(user.displayName ?? user.lineUserId ?? "line-user");
  const avatar =
    user.pictureUrl ?? `https://api.dicebear.com/7.x/initials/svg?radius=50&seed=${avatarSeed}`;

  const tags: string[] = [];
  if (user.relationshipStatus === "following") {
    tags.push("フォロー中");
  } else if (user.relationshipStatus === "blocked") {
    tags.push("ブロック中");
  }

  if (user.channelMode === "standby") {
    tags.push("standby");
  }

  if (user.lastEventType) {
    tags.push(user.lastEventType);
  }

  const lastMessageText = user.lastMessageText?.trim();
  const fallbackMessage =
    user.statusMessage ??
    (user.lastEventType ? `最終イベント: ${user.lastEventType}` : "メッセージ履歴はありません");
  const lastMessage =
    lastMessageText && lastMessageText.length > 0 ? lastMessageText : fallbackMessage;

  return {
    id: user.lineUserId,
    name,
    avatar,
    status: lastMessage,
    lastMessage,
    lastMessageAt: formatTimestamp(user.lastEventAt ?? user.updatedAt ?? null),
    tags: tags.length ? tags : undefined,
    pinned: false,
  };
}

export function formatContactTag(tag: string): string {
  switch (tag) {
    case "outgoing_message":
      return "送信済み";
    case "incoming_message":
      return "受信済み";
    default:
      return tag;
  }
}
