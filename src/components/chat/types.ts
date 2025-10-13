export type Contact = {
  id: string;
  name: string;
  avatar: string;
  status: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount?: number;
  tags?: string[];
  pinned?: boolean;
};
