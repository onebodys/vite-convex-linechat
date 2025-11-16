import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { ChatMessageBubble } from "./chat-message-bubble";
import type { TimelineEntry } from "./types";
import { formatTimelineDateLabel } from "./utils";

/**
 * @description タイムライン全体をスクロール表示するラッパーコンポーネント。
 */
export function ConversationTimeline({
  messages,
  isLoading,
  onRetryMessage,
  retryingMessageIds,
  participantAvatar,
  participantName,
  pinnedMessageIds,
  onPinMessage,
  onUnpinMessage,
  scrollTargetMessageId,
  onScrollTargetAcknowledged,
}: {
  messages: TimelineEntry[];
  isLoading?: boolean;
  onRetryMessage?: (messageId: Id<"messages">) => void;
  retryingMessageIds?: Set<Id<"messages">>;
  participantAvatar?: string;
  participantName?: string;
  pinnedMessageIds?: Set<Id<"messages">>;
  onPinMessage?: (entry: TimelineEntry) => void;
  onUnpinMessage?: (messageId: Id<"messages">) => void;
  scrollTargetMessageId?: Id<"messages"> | null;
  onScrollTargetAcknowledged?: () => void;
}) {
  const messageRefs = useRef(new Map<string, HTMLDivElement>());
  const [highlightedMessageKey, setHighlightedMessageKey] = useState<string | null>(null);

  const timelineBlocks = useMemo(() => {
    const blocks: Array<
      | {
          kind: "marker";
          key: string;
          label: string;
        }
      | {
          kind: "message";
          entry: TimelineEntry;
        }
    > = [];
    let lastDateKey: string | null = null;

    for (const entry of messages) {
      const createdAt = entry.message.createdAt;
      const dateKey = new Date(createdAt).toISOString().slice(0, 10);
      if (dateKey !== lastDateKey) {
        blocks.push({
          kind: "marker",
          key: dateKey,
          label: formatTimelineDateLabel(createdAt),
        });
        lastDateKey = dateKey;
      }
      blocks.push({ kind: "message", entry });
    }

    return blocks;
  }, [messages]);

  const registerMessageRef = useCallback(
    (keyset: { messageId: string; lineMessageId?: string }, node: HTMLDivElement | null) => {
      const keys = [keyset.messageId, keyset.lineMessageId].filter(Boolean) as string[];
      keys.forEach((key) => {
        if (node) {
          messageRefs.current.set(key, node);
        } else {
          messageRefs.current.delete(key);
        }
      });
    },
    [],
  );

  const handleQuoteNavigate = useCallback((lineMessageId: string) => {
    const target = messageRefs.current.get(lineMessageId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedMessageKey(lineMessageId);
  }, []);

  useEffect(() => {
    if (!highlightedMessageKey) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setHighlightedMessageKey(null);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [highlightedMessageKey]);

  useEffect(() => {
    if (!scrollTargetMessageId) {
      return;
    }
    const target = messageRefs.current.get(scrollTargetMessageId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageKey(scrollTargetMessageId);
      onScrollTargetAcknowledged?.();
    }
  }, [onScrollTargetAcknowledged, scrollTargetMessageId]);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#fdfdff] px-8 py-8 text-sm text-slate-500">
        メッセージを読み込み中です…
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 min-h-0 flex-col items-center justify-center gap-3 bg-[#fdfdff] px-6 py-16 text-center text-slate-400">
        <p className="text-sm">まだメッセージがありません。</p>
        <p className="text-xs">最初のメッセージを送信して会話を始めましょう。</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#fdfdff] px-8 py-8">
      <div className="space-y-6">
        {timelineBlocks.map((block) => {
          if (block.kind === "marker") {
            return <TimelineDateChip key={`marker-${block.key}`} label={block.label} />;
          }

          const lineMessageId = block.entry.message.lineMessageId;
          const messageKey = lineMessageId ?? block.entry.message._id;
          return (
            <ChatMessageBubble
              key={block.entry.message._id}
              ref={(node) =>
                registerMessageRef(
                  {
                    messageId: block.entry.message._id,
                    lineMessageId,
                  },
                  node,
                )
              }
              entry={block.entry}
              onRetry={onRetryMessage}
              isRetrying={retryingMessageIds?.has(block.entry.message._id) ?? false}
              isHighlighted={highlightedMessageKey === messageKey}
              onQuoteNavigate={handleQuoteNavigate}
              participantAvatar={participantAvatar}
              participantName={participantName}
              isPinned={pinnedMessageIds?.has(block.entry.message._id) ?? false}
              onPinMessage={() => onPinMessage?.(block.entry)}
              onUnpinMessage={() => onUnpinMessage?.(block.entry.message._id)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * @description タイムライン内で日付区切りを表示するチップ。
 */
function TimelineDateChip({ label }: { label: string }) {
  return (
    <div className="flex justify-center">
      <span className="rounded-full border border-slate-200 bg-white px-4 py-1 text-[11px] font-medium text-slate-400 shadow-sm">
        {label}
      </span>
    </div>
  );
}
