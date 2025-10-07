import type { LineUserSummary } from "../../../shared/line-user";
import { formatTimestamp } from "../../lib/datetime";
import type { Contact } from "./mock-data";

export { formatTimestamp } from "../../lib/datetime";

export function mapLineUserToContact(user: LineUserSummary): Contact {
  const name = user.displayName ?? "LINE ユーザー";
  const handle = user.lineUserId ? `@${user.lineUserId}` : "";
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

  const lastMessage =
    user.statusMessage ??
    (user.lastEventType ? `最終イベント: ${user.lastEventType}` : "メッセージ履歴はありません");

  return {
    id: user.lineUserId,
    name,
    handle,
    avatar,
    status: lastMessage,
    lastMessage,
    lastMessageAt: formatTimestamp(user.lastEventAt ?? user.updatedAt ?? null),
    channel: "line",
    tags: tags.length ? tags : undefined,
    pinned: false,
  };
}
