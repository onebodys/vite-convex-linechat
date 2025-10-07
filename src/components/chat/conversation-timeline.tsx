import { ChatMessageBubble } from "./chat-message-bubble";
import type { Message } from "./mock-data";

export function ConversationTimeline({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
      <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border/60 bg-white/80 px-4 py-1 text-xs text-muted-foreground">
        <span className="font-semibold">今日</span>
        <div className="size-1 rounded-full bg-muted-foreground/50" />
        <span>9 月 29 日</span>
      </div>
      <div className="space-y-6">
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
