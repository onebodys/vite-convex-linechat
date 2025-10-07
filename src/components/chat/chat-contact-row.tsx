import { cn } from "@/lib/utils";
import type { Contact } from "./mock-data";

export type ChatContactRowProps = {
  contact: Contact;
  active?: boolean;
  onSelect?: (contact: Contact) => void;
};

export function ChatContactRow({ contact, active = false, onSelect }: ChatContactRowProps) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={() => onSelect?.(contact)}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition",
        "hover:border-primary/20 hover:bg-primary/5",
        active ? "border-primary/30 bg-primary/10" : "bg-white/40",
      )}
    >
      <div className="relative mt-1 h-12 w-12 overflow-hidden rounded-2xl bg-muted">
        <img
          alt={contact.name}
          src={contact.avatar}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {contact.pinned ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            ★
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{contact.name}</p>
            <p className="text-xs text-muted-foreground">{contact.handle}</p>
          </div>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {contact.lastMessageAt}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground/80">{contact.lastMessage}</p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
              contact.channel === "line"
                ? "bg-lime-100 text-lime-600"
                : contact.channel === "instagram"
                  ? "bg-pink-100 text-pink-600"
                  : "bg-sky-100 text-sky-600",
            )}
          >
            {contact.channel === "line" ? "LINE" : contact.channel === "email" ? "メール" : "SNS"}
          </span>
          {contact.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {contact.unreadCount ? (
            <span className="ml-auto inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {contact.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
