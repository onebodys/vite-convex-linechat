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

export const contacts: Contact[] = [
  {
    id: "1",
    name: "佐藤 花",
    handle: "@hana_sato",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=hana",
    status: "新しい問い合わせ",
    lastMessage: "予約の空き状況を教えてください",
    lastMessageAt: "09:12",
    unreadCount: 3,
    channel: "line",
    tags: ["新規", "優先"],
    pinned: true,
  },
  {
    id: "2",
    name: "LINE 公式アカウント",
    handle: "@line_official",
    avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=line",
    status: "配信予約: 11:00",
    lastMessage: "配信が承認されました",
    lastMessageAt: "08:30",
    channel: "line",
    tags: ["自動化"],
  },
  {
    id: "3",
    name: "田中 太郎",
    handle: "@tanaka001",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=tanaka",
    status: "応答待ち",
    lastMessage: "ご連絡ありがとうございます！また改めてご案内します。",
    lastMessageAt: "土曜日",
    channel: "line",
    tags: ["既存"],
    unreadCount: 1,
  },
  {
    id: "4",
    name: "サポート窓口",
    handle: "support@line.com",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SP",
    status: "SLAs 良好",
    lastMessage: "今月のレポートを共有します",
    lastMessageAt: "金曜日",
    channel: "email",
  },
];

export type Message = {
  id: string;
  author: "agent" | "customer";
  content: string;
  sentAt: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: "image" | "file";
    size?: string;
  }>;
  status?: "sent" | "delivered" | "read";
};

export const timeline: Message[] = [
  {
    id: "m-1",
    author: "customer",
    content: "こんにちは！今日の15時頃って空いてますか？",
    sentAt: "09:04",
  },
  {
    id: "m-2",
    author: "agent",
    content: "こんにちは、ありがとうございます。15時から20分ほどでいかがでしょうか？",
    sentAt: "09:06",
    status: "delivered",
  },
  {
    id: "m-3",
    author: "customer",
    content: "大丈夫です！あと予約に必要なものがあれば教えてください。",
    sentAt: "09:08",
  },
  {
    id: "m-4",
    author: "agent",
    content:
      "ありがとうございます。当日は本人確認書類をお持ちください。LINEによる事前アンケートも送りますね。",
    sentAt: "09:10",
    attachments: [
      {
        id: "att-1",
        name: "事前アンケート.pdf",
        type: "file",
        size: "320KB",
      },
    ],
    status: "sent",
  },
];

export const quickReplies = [
  "いつもありがとうございます！",
  "詳細を確認して再度ご連絡します。",
  "担当者へ共有しますので少々お待ちください。",
];

export const channels = [
  { id: "all", label: "全て" },
  { id: "unread", label: "未読" },
  { id: "pinned", label: "ピン留め" },
  { id: "line", label: "LINE" },
];
