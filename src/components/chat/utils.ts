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

  const rawSummary = user.lastMessageSummary?.trim();
  const lastMessage =
    rawSummary && rawSummary.length > 0
      ? rawSummary
      : user.lastMessagePreviewType === "media"
        ? "[メディア]"
        : user.lastMessagePreviewType === "template"
          ? "[テンプレート]"
          : "";

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

/**
 * @description タイムラインのチップ用に「10/20(木)」形式へ整形する。
 */
export function formatTimelineDateLabel(timestamp: number): string {
  if (!timestamp) {
    return "--/--";
  }

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(new Date(timestamp));
}
