export type ConversationHeaderProps = {
  title: string;
  badgeLabel?: string;
};

/**
 * @description 会話ヘッダーを LINE 管理画面のようなトーンで表示する。
 */
export function ConversationHeader({ title, badgeLabel }: ConversationHeaderProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-slate-200 px-8 py-4">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {badgeLabel ? (
        <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600">
          {badgeLabel}
        </span>
      ) : null}
    </div>
  );
}
