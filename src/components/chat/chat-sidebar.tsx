import { Menu, Search } from "lucide-react";
import { ChatContactRow } from "./chat-contact-row";
import type { Contact } from "./types";

export type ChatSidebarProps = {
  contacts: Contact[];
  isLoading: boolean;
  activeContactId?: string;
  onSelectContact?: (contact: Contact) => void;
};

/**
 * @description LINE公式の左カラムに合わせてリストと検索UIを構成するサイドバー。
 */
export function ChatSidebar({
  contacts,
  isLoading,
  activeContactId,
  onSelectContact,
}: ChatSidebarProps) {
  return (
    <aside className="hidden w-80 flex-col border-r border-slate-200 bg-[#f7f8fb] lg:flex">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2">
            <Menu className="size-4 text-slate-400" />
            すべて
          </span>
          <span className="text-xs text-slate-400">{contacts.length} 件</span>
        </div>
        <p className="text-[11px] text-slate-400">LINE 公式アカウントの友だち一覧</p>
      </div>

      <div className="px-4 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full rounded-full border border-slate-200 bg-white px-9 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400"
            placeholder="名前・タグ・メモで検索"
          />
        </div>
        <div className="mt-3 flex gap-2 text-xs">
          {[{ label: "すべて", active: true }, { label: "対応待ち" }, { label: "担当あり" }].map(
            ({ label, active }) => (
              <button
                key={label}
                type="button"
                className={`rounded-full px-3 py-1 font-medium ${
                  active
                    ? "bg-white text-emerald-600 shadow"
                    : "border border-transparent text-slate-500 hover:border-slate-200"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-4">
        {isLoading ? (
          <p className="px-2 text-sm text-slate-500">ユーザーを読み込み中です…</p>
        ) : contacts.length === 0 ? (
          <p className="px-2 text-sm text-slate-500">表示できる LINE ユーザーがまだいません。</p>
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
