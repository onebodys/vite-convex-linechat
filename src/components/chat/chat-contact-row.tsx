import { cn } from "@/lib/utils";
import type { Contact } from "./types";
import { formatContactTag } from "./utils";

export type ChatContactRowProps = {
  contact: Contact;
  active?: boolean;
  onSelect?: (contact: Contact) => void;
};

/**
 * @description サイドバーの1行を LINE 公式に近いカードスタイルで描画する。
 */
export function ChatContactRow({ contact, active = false, onSelect }: ChatContactRowProps) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={() => onSelect?.(contact)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
        active
          ? "border-emerald-400/70 bg-white shadow"
          : "border-transparent bg-white/60 hover:border-slate-200 hover:bg-white",
      )}
    >
      <div className="relative h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
        <img
          alt={contact.name}
          src={contact.avatar}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {contact.pinned ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-white">
            ★
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="flex-1 truncate text-sm font-semibold text-slate-800">{contact.name}</p>
          <span className="text-[11px] text-slate-400">{contact.lastMessageAt}</span>
        </div>
        <p className="line-clamp-1 text-xs text-slate-500">
          {contact.lastMessage || "メッセージなし"}
        </p>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
            LINE
          </span>
          {contact.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
            >
              {formatContactTag(tag)}
            </span>
          ))}
          {contact.unreadCount ? (
            <span className="ml-auto inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-emerald-500 px-2 text-[11px] font-semibold text-white">
              {contact.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
