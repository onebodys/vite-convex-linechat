import type { Doc } from "../../../convex/_generated/dataModel";

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
 * @description タイムライン表示用のメッセージと添付メディアのセット。
 */
export type TimelineEntry = {
  message: Doc<"messages">;
  media?: {
    mediaType: "image" | "video" | "audio" | "file" | "sticker";
    url?: string;
    fileName?: string;
    mimeType?: string;
    sizeBytes?: number;
  };
};
