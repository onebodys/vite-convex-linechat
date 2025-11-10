import { ChevronDown, Paperclip, Plus, Send, Smile } from "lucide-react";
import type { ComponentType, FormEvent } from "react";
import { Button } from "@/components/ui/button";

export type MessageComposerProps = {
  onSend?: (message: string) => void;
  onAttachFile?: () => void;
  onInsertTemplate?: () => void;
  onToggleEmoji?: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
};

/**
 * @description メッセージ入力欄と送信操作を LINE クライアント風にまとめたフォーム。
 */
export function MessageComposer({
  onSend,
  onAttachFile,
  onInsertTemplate,
  onToggleEmoji,
  disabled = false,
  isSubmitting = false,
}: MessageComposerProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || isSubmitting) {
      return;
    }
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
      className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
    >
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-500">メッセージ</span>
        <textarea
          name="message"
          className="min-h-[120px] w-full resize-none rounded-2xl border border-transparent bg-[#f5f7fb] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
          placeholder="Enter で送信 / Shift+Enter で改行"
          disabled={disabled}
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ComposerIconButton
            icon={Paperclip}
            label="ファイル"
            onClick={onAttachFile}
            disabled={disabled || isSubmitting}
          />
          <ComposerIconButton
            icon={Smile}
            label="スタンプ"
            onClick={onToggleEmoji}
            disabled={disabled || isSubmitting}
          />
          <ComposerIconButton
            icon={Plus}
            label="テンプレ"
            onClick={onInsertTemplate}
            disabled={disabled || isSubmitting}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px]">Enter で送信 / Shift+Enter で改行</span>
          <Button
            type="submit"
            className="rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-500/90"
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? "送信中" : "送信"}
            <Send className="ml-2 size-4" />
            <ChevronDown className="ml-1 size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * @description 作成フッターで使う小型アイコンボタン。
 */
function ComposerIconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:border-emerald-300 disabled:opacity-50"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
