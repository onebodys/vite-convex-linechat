import { BadgeCheck, CircleAlert, Clock } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Id } from "../../../convex/_generated/dataModel";
import type { TimelineEntry } from "./types";

const formatBubbleTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

type ChatMessageBubbleProps = {
  entry: TimelineEntry;
  onRetry?: (messageId: Id<"messages">) => void;
  isRetrying?: boolean;
  isHighlighted?: boolean;
  onQuoteNavigate?: (lineMessageId: string) => void;
};

/**
 * @description チャットタイムラインの1件分を表示するバブルコンポーネント。
 */
export const ChatMessageBubble = forwardRef<HTMLDivElement, ChatMessageBubbleProps>(
  ({ entry, onRetry, isRetrying = false, isHighlighted = false, onQuoteNavigate }, ref) => {
    const { message, media } = entry;
    const isAgent = message.direction === "outgoing";
    const status = message.status;
    const content = message.content;

    const quotedPreview = (() => {
      const quoted = message.quotedMessage;
      if (!quoted) {
        return undefined;
      }

      const fallbackLabel = quoted.messageType ? `[${quoted.messageType}]` : "[引用メッセージ]";

      return {
        displayName: quoted.displayName ?? "返信元",
        text: quoted.text ?? fallbackLabel,
      };
    })();

    const handleRetry = () => {
      if (!onRetry) {
        return;
      }
      onRetry(message._id);
    };

    const handleQuoteNavigate = () => {
      if (!message.quotedMessage?.lineMessageId) {
        return;
      }
      onQuoteNavigate?.(message.quotedMessage.lineMessageId);
    };

    const renderMedia = () => {
      if (!media) {
        return (
          <p className="opacity-80">
            {content.kind === "media" ? `[${content.mediaType}]` : "[メディア]"}
          </p>
        );
      }

      const label = media.fileName ?? `[${media.mediaType}]`;

      if (media.mediaType === "image" && media.url) {
        return (
          <div className="space-y-2">
            <img
              src={media.url}
              alt={label}
              className="max-h-64 w-full rounded-xl object-contain"
              loading="lazy"
            />
            {media.fileName ? <p className="text-xs opacity-70">{media.fileName}</p> : null}
          </div>
        );
      }

      if (media.mediaType === "video" && media.url) {
        return (
          <div className="space-y-2">
            {/* biome-ignore lint/a11y/useMediaCaption: 動画に付随する字幕ファイルが存在しないため */}
            <video className="max-h-64 w-full rounded-xl" controls src={media.url} />
            {media.fileName ? <p className="text-xs opacity-70">{media.fileName}</p> : null}
          </div>
        );
      }

      if (media.mediaType === "audio" && media.url) {
        return (
          <div className="space-y-2">
            {/* biome-ignore lint/a11y/useMediaCaption: 音声メッセージの字幕データが提供されないため */}
            <audio controls src={media.url} className="w-full" />
            <p className="text-xs opacity-70">{label}</p>
          </div>
        );
      }

      if (media.url) {
        return (
          <div className="space-y-2">
            <a
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-full items-center gap-2 truncate underline"
            >
              {label}
            </a>
            {media.mimeType ? <p className="text-xs opacity-70">{media.mimeType}</p> : null}
          </div>
        );
      }

      return <p className="opacity-80">{label}</p>;
    };

    const renderContent = () => {
      if (content.kind === "text") {
        return <p className="whitespace-pre-line break-words">{content.text}</p>;
      }

      if (content.kind === "media") {
        return renderMedia();
      }

      return <p className="whitespace-pre-line break-words opacity-80">{content.altText}</p>;
    };

    return (
      <div
        ref={ref}
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
              isHighlighted && "animate-bubble-shake ring-2 ring-primary/60",
            )}
          >
            <div className="space-y-2">
              {quotedPreview ? (
                <button
                  type="button"
                  onClick={handleQuoteNavigate}
                  disabled={!message.quotedMessage?.lineMessageId}
                  className={cn(
                    "w-full rounded-2xl border px-3 py-2 text-left text-xs transition",
                    isAgent
                      ? "border-white/40 bg-white/10 text-primary-foreground/80 hover:bg-white/20 disabled:opacity-60"
                      : "border-muted bg-muted/40 text-muted-foreground hover:bg-muted/70 disabled:opacity-60",
                  )}
                >
                  <p className="font-medium">{quotedPreview.displayName}</p>
                  <p className="line-clamp-2 whitespace-pre-line">{quotedPreview.text}</p>
                </button>
              ) : null}
              {renderContent()}
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground",
              isAgent && "justify-end",
            )}
          >
            <span>{formatBubbleTime(message.createdAt)}</span>
            {isAgent && status ? (
              <>
                <StatusIndicator status={status} />
                {status === "failed" && onRetry && content.kind === "text" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? "再送中…" : "再送"}
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

type MessageStatus = TimelineEntry["message"]["status"];

/**
 * @description 送信ステータスに応じてラベルを返すインジケーター。
 */
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
  if (status === "canceled") {
    return (
      <span className="inline-flex items-center gap-1 text-amber-500">
        <CircleAlert className="size-3" />
        キャンセル
      </span>
    );
  }
  return null;
}
