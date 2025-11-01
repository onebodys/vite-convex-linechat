import { useCallback, useEffect, useRef, useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { ChatMessageBubble } from "./chat-message-bubble";
import type { TimelineEntry } from "./types";

/**
 * @description タイムライン全体をスクロール表示するラッパーコンポーネント。
 */
export function ConversationTimeline({
  messages,
  isLoading,
  onRetryMessage,
  retryingMessageIds,
}: {
  messages: TimelineEntry[];
  isLoading?: boolean;
  onRetryMessage?: (messageId: Id<"messages">) => void;
  retryingMessageIds?: Set<Id<"messages">>;
}) {
  const messageRefs = useRef(new Map<string, HTMLDivElement>());
  const [highlightedLineMessageId, setHighlightedLineMessageId] = useState<string | null>(null);

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
      <div className="flex-1 overflow-y-auto px-6 py-6 text-sm text-muted-foreground">
        メッセージを読み込み中です…
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center text-muted-foreground">
        <p className="text-sm text-muted-foreground/80">まだメッセージがありません。</p>
        <p className="text-xs text-muted-foreground/60">
          最初のメッセージを送信して会話を始めましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
      <div className="space-y-6">
        {messages.map((message) => {
          const lineMessageId = message.message.lineMessageId;
          return (
            <ChatMessageBubble
              key={message.message._id}
              ref={(node) => registerMessageRef(lineMessageId, node)}
              entry={message}
              onRetry={onRetryMessage}
              isRetrying={retryingMessageIds?.has(message.message._id) ?? false}
              isHighlighted={
                lineMessageId !== undefined && highlightedLineMessageId === lineMessageId
              }
              onQuoteNavigate={handleQuoteNavigate}
            />
          );
        })}
      </div>
    </div>
  );
}
