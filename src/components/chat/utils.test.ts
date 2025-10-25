import { afterEach, describe, expect, it, vi } from "vitest";
import type { LineUserSummary } from "../../../shared/line-user";
import { formatContactTag, formatTimestamp, mapLineUserToContact } from "./utils";

afterEach(() => {
  vi.useRealTimers();
});

describe("mapLineUserToContact", () => {
  it("整形済みのメタデータを優先して Contact を生成する", () => {
    const now = new Date("2024-01-02T12:00:00Z");
    vi.setSystemTime(now);

    const lastEventAt = new Date("2024-01-02T09:30:00Z").getTime();

    const user: LineUserSummary = {
      lineUserId: "line-user-1",
      displayName: "山田太郎",
      pictureUrl: "https://example.com/avatar.png",
      statusMessage: null,
      lastMessageSummary: "  こんにちは！ ",
      lastMessagePreviewType: "text",
      lastMessageDirection: "incoming",
      lastEventType: "message",
      lastEventAt,
      relationshipStatus: "following",
      channelMode: "standby",
      lastFollowedAt: null,
      lastUnblockedAt: null,
      blockedAt: null,
      updatedAt: lastEventAt,
      isRedelivery: null,
    };

    const contact = mapLineUserToContact(user);

    expect(contact).toMatchObject({
      id: "line-user-1",
      name: "山田太郎",
      avatar: "https://example.com/avatar.png",
      lastMessage: "こんにちは！",
      status: "こんにちは！",
      lastMessageDirection: "incoming",
      tags: ["incoming", "フォロー中", "standby"],
    });

    expect(contact.lastMessageAt).toBe(formatTimestamp(lastEventAt));
  });

  it("メタデータが存在しない場合は空文字とフォールバックなしで返す", () => {
    const now = new Date("2024-04-15T08:00:00Z");
    vi.setSystemTime(now);

    const user: LineUserSummary = {
      lineUserId: "line-user-2",
      displayName: null,
      pictureUrl: null,
      statusMessage: null,
      lastMessageSummary: undefined,
      lastMessagePreviewType: null,
      lastMessageDirection: null,
      lastEventType: null,
      lastEventAt: null,
      relationshipStatus: "unknown",
      channelMode: "active",
      lastFollowedAt: null,
      lastUnblockedAt: null,
      blockedAt: null,
      updatedAt: now.getTime(),
      isRedelivery: null,
    };

    const contact = mapLineUserToContact(user);

    expect(contact).toMatchObject({
      id: "line-user-2",
      name: "LINE ユーザー",
      avatar: "https://api.dicebear.com/7.x/initials/svg?radius=50&seed=line-user-2",
      lastMessage: "",
      status: "",
      lastMessageDirection: undefined,
      tags: undefined,
    });
  });
});

describe("formatContactTag", () => {
  it("送信方向のタグを整形する", () => {
    expect(formatContactTag("outgoing")).toBe("送信済み");
    expect(formatContactTag("incoming")).toBe("受信済み");
  });

  it("未知のタグはそのまま返す", () => {
    expect(formatContactTag("フォロー中")).toBe("フォロー中");
  });
});
