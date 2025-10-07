import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "./mock-data";

export function ChatMessageBubble({ message }: { message: Message }) {
  const isAgent = message.author === "agent";

  return (
    <div
      className={cn("flex gap-3", isAgent ? "flex-row-reverse" : "flex-row")}
      data-side={isAgent ? "agent" : "customer"}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-sm font-medium text-muted-foreground">
        {isAgent ? "OP" : "GU"}
      </div>
      <div
        className={cn("max-w-[70%] space-y-2", isAgent && "items-end text-right")}
        data-side={isAgent ? "agent" : "customer"}
      >
        <div
          className={cn(
            "rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isAgent ? "ml-auto bg-primary text-primary-foreground" : "bg-white text-foreground",
          )}
        >
          <p>{message.content}</p>
          {message.attachments?.length ? (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3 py-2",
                    isAgent
                      ? "border-primary/40 bg-primary/20 text-primary-foreground"
                      : "border-border bg-muted/60 text-muted-foreground",
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-xl bg-black/10 text-xs font-semibold uppercase">
                    {attachment.type === "image" ? "IMG" : "PDF"}
                  </div>
                  <div className="flex-1 text-left text-xs">
                    <p className="font-medium">{attachment.name}</p>
                    {attachment.size ? (
                      <p className="text-muted-foreground/80">{attachment.size}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "text-xs font-semibold",
                      isAgent ? "text-primary-foreground/80" : "text-primary",
                    )}
                  >
                    ダウンロード
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isAgent && "justify-end",
          )}
        >
          <span>{message.sentAt}</span>
          {isAgent && message.status ? (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="size-3" />
              {message.status === "read"
                ? "既読"
                : message.status === "delivered"
                  ? "配信済み"
                  : "送信済み"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
