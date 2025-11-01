import type { TimelineEntry as SharedTimelineEntry } from "../../../shared/timeline-entry";

/**
 * @description サイドバーに表示する連絡先情報。
 */
export type Contact = {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageDirection?: "incoming" | "outgoing";
  unreadCount?: number;
  tags?: string[];
  pinned?: boolean;
};

/**
 * @description タイムライン表示用のメッセージと添付メディアのセット。sharedモジュールの定義を再利用する。
 */
export type TimelineEntry = SharedTimelineEntry;
