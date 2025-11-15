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
}: {
  messages: TimelineEntry[];
  isLoading?: boolean;
  onRetryMessage?: (messageId: Id<"messages">) => void;
  retryingMessageIds?: Set<Id<"messages">>;
  participantAvatar?: string;
  participantName?: string;
}) {
  const messageRefs = useRef(new Map<string, HTMLDivElement>());
  const [highlightedLineMessageId, setHighlightedLineMessageId] = useState<string | null>(null);

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

  const registerMessageRef = useCallback((key: string | undefined, node: HTMLDivElement | null) => {
    if (!key) {
      return;
    }

    if (node) {
      messageRefs.current.set(key, node);
    } else {
      messageRefs.current.delete(key);
    }
  }, []);

  const handleQuoteNavigate = useCallback((lineMessageId: string) => {
    const target = messageRefs.current.get(lineMessageId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedLineMessageId(lineMessageId);
  }, []);

  useEffect(() => {
    if (!highlightedLineMessageId) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      setHighlightedLineMessageId(null);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [highlightedLineMessageId]);

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
          return (
            <ChatMessageBubble
              key={block.entry.message._id}
              ref={(node) => registerMessageRef(lineMessageId, node)}
              entry={block.entry}
              onRetry={onRetryMessage}
              isRetrying={retryingMessageIds?.has(block.entry.message._id) ?? false}
              isHighlighted={
                lineMessageId !== undefined && highlightedLineMessageId === lineMessageId
              }
              onQuoteNavigate={handleQuoteNavigate}
              participantAvatar={participantAvatar}
              participantName={participantName}
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
