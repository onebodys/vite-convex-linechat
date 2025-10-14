import type { LineUserSummary } from "../../../shared/line-user";
import { formatTimestamp } from "../../lib/datetime";
import type { Contact } from "./types";

export { formatTimestamp } from "../../lib/datetime";

/** Convex の `LineUserSummary` をチャット UI が扱う `Contact` 形に整形する。 */
export function mapLineUserToContact(user: LineUserSummary): Contact {
  const name = user.displayName ?? "LINE ユーザー";
  const avatarSeed = encodeURIComponent(user.displayName ?? user.lineUserId ?? "line-user");
  const avatar =
    user.pictureUrl ?? `https://api.dicebear.com/7.x/initials/svg?radius=50&seed=${avatarSeed}`;

  const tags: string[] = [];
  if (user.lastMessageDirection) {
    tags.push(user.lastMessageDirection);
  }

  if (user.relationshipStatus === "following") {
    tags.push("フォロー中");
  } else if (user.relationshipStatus === "blocked") {
    tags.push("ブロック中");
  }

  if (user.channelMode === "standby") {
    tags.push("standby");
  }

  const lastMessage = user.lastMessageText?.trim() ?? "";

  return {
    id: user.lineUserId,
    name,
    avatar,
    status: lastMessage,
    lastMessage,
    lastMessageAt: formatTimestamp(user.lastEventAt ?? user.updatedAt ?? null),
    lastMessageDirection: user.lastMessageDirection ?? undefined,
    tags: tags.length ? tags : undefined,
    pinned: false,
  };
}

export function formatContactTag(tag: string): string {
  switch (tag) {
    case "outgoing":
      return "送信済み";
    case "incoming":
      return "受信済み";
    default:
      return tag;
  }
}
