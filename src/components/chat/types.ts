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
