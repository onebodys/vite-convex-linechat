import { MoreVertical, Phone, RefreshCcw, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ConversationHeaderProps = {
  title: string;
  subtitle: string;
  badgeLabel?: string;
};

/**
 * @description 会話ヘッダーを LINE 管理画面のようなトーンで表示する。
 */
export function ConversationHeader({ title, subtitle, badgeLabel }: ConversationHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-8 py-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">現在の会話</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
          {badgeLabel ? (
            <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
              {badgeLabel}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          対応状況
        </button>
        <Button variant="ghost" size="icon" className="rounded-2xl border border-slate-200">
          <RefreshCcw className="size-4" />
          <span className="sr-only">履歴を更新</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-2xl border border-slate-200">
          <Phone className="size-4" />
          <span className="sr-only">音声通話</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-2xl border border-slate-200">
          <Video className="size-4" />
          <span className="sr-only">ビデオ通話</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-2xl border border-slate-200">
          <MoreVertical className="size-4" />
          <span className="sr-only">その他の操作</span>
        </Button>
      </div>
    </div>
  );
}
