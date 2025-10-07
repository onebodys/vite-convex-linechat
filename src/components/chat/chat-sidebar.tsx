import { Filter, Search } from "lucide-react";
import { ChannelFilterBar, type ChannelFilterBarProps } from "./channel-filter-bar";
import { ChatContactRow } from "./chat-contact-row";
import type { Contact } from "./mock-data";

export type ChatSidebarProps = {
  contacts: Contact[];
  isLoading: boolean;
  channels: ChannelFilterBarProps["channels"];
  activeChannelId?: string;
  onSelectChannel?: ChannelFilterBarProps["onSelectChannel"];
  activeContactId?: string;
  onSelectContact?: (contact: Contact) => void;
};

export function ChatSidebar({
  contacts,
  isLoading,
  channels,
  activeChannelId = "all",
  onSelectChannel,
  activeContactId,
  onSelectContact,
}: ChatSidebarProps) {
  return (
    <aside className="hidden flex-col gap-6 rounded-3xl border border-border/60 bg-white/75 p-5 shadow-inner lg:flex">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-full border border-border/60 bg-white/80 px-10 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
            placeholder="名前・タグ・メモで検索"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            <Filter className="size-3.5" />
            フィルター
          </button>
        </div>
        <ChannelFilterBar
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={onSelectChannel}
        />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="px-2 text-sm text-muted-foreground">ユーザーを読み込み中です…</p>
        ) : contacts.length === 0 ? (
          <p className="px-2 text-sm text-muted-foreground">
            表示できる LINE ユーザーがまだいません。
          </p>
        ) : (
          contacts.map((contact) => (
            <ChatContactRow
              key={contact.id}
              contact={contact}
              active={contact.id === activeContactId}
              onSelect={onSelectContact}
            />
          ))
        )}
      </div>
    </aside>
  );
}
