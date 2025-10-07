import { Paperclip, Plus, Send, Smile } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";

export type MessageComposerProps = {
  onSend?: (message: string) => void;
  onAttachFile?: () => void;
  onInsertTemplate?: () => void;
  onToggleEmoji?: () => void;
};

export function MessageComposer({
  onSend,
  onAttachFile,
  onInsertTemplate,
  onToggleEmoji,
}: MessageComposerProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = (formData.get("message") as string) ?? "";
    if (message.trim().length === 0) {
      return;
    }
    onSend?.(message);
    event.currentTarget.reset();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 rounded-3xl border border-border/70 bg-white/90 p-3 shadow-sm"
    >
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-2xl"
          onClick={onAttachFile}
        >
          <Paperclip className="size-5" />
          <span className="sr-only">ファイル添付</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-2xl"
          onClick={onToggleEmoji}
        >
          <Smile className="size-5" />
          <span className="sr-only">スタンプ</span>
        </Button>
      </div>
      <label className="flex flex-1 flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">返信メッセージ</span>
        <textarea
          name="message"
          className="min-h-[96px] w-full resize-none rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
          placeholder="メッセージを入力..."
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>外部公開メッセージ</span>
          <span>Shift + Enter で改行</span>
        </div>
      </label>
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-2xl"
          onClick={onInsertTemplate}
        >
          <Plus className="size-5" />
          <span className="sr-only">テンプレートを挿入</span>
        </Button>
        <Button type="submit" className="rounded-2xl px-5">
          送信
          <Send className="ml-2 size-4" />
        </Button>
      </div>
    </form>
  );
}
