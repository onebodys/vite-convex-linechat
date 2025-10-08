import type { Doc } from "../../../convex/_generated/dataModel";
import { ChatMessageBubble } from "./chat-message-bubble";

export function ConversationTimeline({
  messages,
  isLoading,
}: {
  messages: Doc<"messages">[];
  isLoading?: boolean;
}) {
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
        {messages.map((message) => (
          <ChatMessageBubble key={message._id} message={message} />
        ))}
      </div>
    </div>
  );
}
