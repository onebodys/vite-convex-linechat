export type Contact = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  channel: "line" | "instagram" | "email";
  tags?: string[];
  pinned?: boolean;
};

export const channels = [
  { id: "all", label: "全て" },
  { id: "unread", label: "未読" },
  { id: "pinned", label: "ピン留め" },
  { id: "line", label: "LINE" },
];
