import { BadgeCheck, CircleAlert, Clock, MoreHorizontal } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  participantAvatar?: string;
  participantName?: string;
  isPinned?: boolean;
  onPinMessage?: (entry: TimelineEntry) => void;
  onUnpinMessage?: (messageId: Id<"messages">) => void;
};

/**
 * @description チャットタイムラインの1件分を表示するバブルコンポーネント。
 */
export const ChatMessageBubble = forwardRef<HTMLDivElement, ChatMessageBubbleProps>(
  (
    {
      entry,
      onRetry,
      isRetrying = false,
      isHighlighted = false,
      onQuoteNavigate,
      participantAvatar,
      participantName,
      isPinned = false,
      onPinMessage,
      onUnpinMessage,
    },
    ref,
  ) => {
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

    const resolvedAvatar =
      participantAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?radius=50&seed=${encodeURIComponent(
        participantName ?? message.lineUserId ?? "line-user",
      )}`;

    const bubbleColors = isAgent
      ? { background: "#d6f5d3", text: "text-slate-800" }
      : { background: "#f1f3f7", text: "text-slate-800" };

    const tailClipPath = isAgent
      ? "polygon(0% 0%, 100% 50%, 0% 100%)"
      : "polygon(100% 0%, 0% 50%, 100% 100%)";

    const handlePinToggle = () => {
      if (isPinned) {
        onUnpinMessage?.(message._id);
      } else {
        onPinMessage?.(entry);
      }
    };

    const pinActionLabel = isPinned ? "ピン留めを解除" : "ピン留め";

    return (
      <div ref={ref} className="flex items-start gap-3" data-side={isAgent ? "agent" : "customer"}>
        {!isAgent ? (
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
            <img
              src={resolvedAvatar}
              alt={participantName ?? "LINE ユーザー"}
              className="size-full object-cover"
            />
          </div>
        ) : null}
        <div
          className={cn(
            "flex max-w-[70%] flex-col gap-1",
            isAgent ? "ml-auto items-end" : "items-start",
          )}
          data-side={isAgent ? "agent" : "customer"}
        >
          <div className="group relative w-full">
            <div
              className={cn(
                "relative w-full overflow-visible rounded-3xl px-4 py-3 text-left text-sm leading-relaxed shadow-sm",
                bubbleColors.text,
                isAgent
                  ? "shadow-[0_4px_14px_rgba(16,185,129,0.15)]"
                  : "shadow-[0_6px_18px_rgba(15,23,42,0.08)]",
                isHighlighted && "animate-bubble-shake ring-2 ring-emerald-200",
              )}
              style={{ backgroundColor: bubbleColors.background }}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-1/2 block h-4 w-3 -translate-y-1/2",
                  isAgent ? "-right-2" : "-left-2",
                )}
                style={{
                  clipPath: tailClipPath,
                  backgroundColor: bubbleColors.background,
                }}
              />
              <div className="space-y-2">
                {quotedPreview ? (
                  <button
                    type="button"
                    onClick={handleQuoteNavigate}
                    disabled={!message.quotedMessage?.lineMessageId}
                    className={cn(
                      "w-full rounded-2xl border px-3 py-2 text-left text-xs transition",
                      isAgent
                        ? "border-emerald-200 bg-white/80 text-emerald-700 hover:bg-white disabled:opacity-60"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-60",
                    )}
                  >
                    <p className="font-medium">{quotedPreview.displayName}</p>
                    <p className="line-clamp-2 whitespace-pre-line">{quotedPreview.text}</p>
                  </button>
                ) : null}
                {renderContent()}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "absolute hidden rounded-full bg-white/90 p-1 text-slate-400 shadow group-hover:flex group-focus-within:flex focus-visible:flex",
                    isAgent ? "-left-2 bottom-1" : "-right-2 bottom-1",
                  )}
                >
                  <MoreHorizontal className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isAgent ? "end" : "start"}>
                <DropdownMenuItem className="text-slate-300" disabled>
                  リプライ
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300" disabled>
                  リンクをコピー
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    handlePinToggle();
                  }}
                >
                  {pinActionLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div
            className={cn(
              "flex flex-wrap items-center gap-2 text-[11px] text-slate-400",
              isAgent ? "justify-end" : "justify-start",
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
                    className="h-7 rounded-full border-slate-300 px-3 text-[11px]"
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
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <BadgeCheck className="size-3" />
        送信済み
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-slate-500">
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
