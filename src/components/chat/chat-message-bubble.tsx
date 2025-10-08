import { BadgeCheck, CircleAlert, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc } from "../../../convex/_generated/dataModel";

const formatBubbleTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export function ChatMessageBubble({ message }: { message: Doc<"messages"> }) {
  const isAgent = message.direction === "outgoing";
  const status = message.status;

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
          <p className="whitespace-pre-line break-words">{message.text}</p>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isAgent && "justify-end",
          )}
        >
          <span>{formatBubbleTime(message.createdAt)}</span>
          {isAgent && status ? <StatusIndicator status={status} /> : null}
        </div>
      </div>
    </div>
  );
}

type MessageStatus = Doc<"messages">["status"];

function StatusIndicator({ status }: { status: MessageStatus }) {
  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1">
        <BadgeCheck className="size-3" />
        送信済み
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3" />
        送信中
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-rose-500">
        <CircleAlert className="size-3" />
        失敗
      </span>
    );
  }
  return null;
}
