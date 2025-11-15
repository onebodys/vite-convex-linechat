import { BadgeCheck, Calendar, Edit3, PenLine, Plus, Tag, UserRound } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import type { Contact } from "./types";

/**
 * @description 選択中の LINE ユーザー情報とメモ欄をまとめて表示するサイドパネル。
 */
export function ContactInspector({ contact }: { contact: Contact | null }) {
  if (!contact) {
    return (
      <aside className="hidden h-full w-80 min-h-0 flex-col border-l border-slate-200 bg-white/70 px-5 py-6 text-sm text-slate-500 lg:flex">
        <p className="text-center text-xs">ユーザーを選択すると詳細が表示されます。</p>
      </aside>
    );
  }

  return (
    <aside className="hidden h-full w-80 min-h-0 flex-col overflow-y-auto border-l border-slate-200 bg-white px-5 py-6 text-sm text-slate-700 lg:flex">
      <section className="flex flex-col items-center gap-3 pb-6">
        <div className="relative inline-flex">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="size-20 rounded-full border border-slate-200 bg-slate-100 object-cover"
          />
          <span className="absolute -right-1 -top-1 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-semibold text-white">
            <BadgeCheck className="size-3" />
            友だち
          </span>
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-900">{contact.name}</p>
          <p className="text-xs text-slate-500">LINE ユーザー ID: {contact.id}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Edit3 className="size-3.5" />
            プロフィール編集
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <PenLine className="size-3.5" />
            メモ
          </button>
        </div>
      </section>

      <SectionCard title="基本情報">
        <InfoRow icon={UserRound} label="担当者" value="くまがい" actionLabel="変更" />
        <InfoRow icon={Calendar} label="最終応対" value={contact.lastMessageAt || "---"} />
      </SectionCard>

      <SectionCard title="タグ">
        <div className="flex flex-wrap gap-2">
          {(contact.tags ?? ["未分類"]).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600"
            >
              <Tag className="size-3" />
              {tag}
            </span>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 text-[11px] text-slate-500 hover:border-slate-400"
          >
            <Plus className="size-3" />
            追加
          </button>
        </div>
      </SectionCard>

      <SectionCard title="ノート">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>1/1</span>
          <button type="button" className="inline-flex items-center gap-1 text-emerald-600">
            <Plus className="size-3" />
            ノートを追加
          </button>
        </div>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-600">
          <p className="font-semibold">ノートその1</p>
          <p className="mt-1 text-slate-500">2025/11/04 18:19 ・ くまがい</p>
          <p className="mt-2">
            顧客メモをここに追加します。正式リリース時は Convex のノートデータと連携予定です。
          </p>
        </div>
      </SectionCard>
    </aside>
  );
}

/**
 * @description 情報ブロックを淡いカード型で整える内部コンポーネント。
 */
function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] last:mb-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      {children}
    </section>
  );
}

/**
 * @description ラベル・値・操作リンクを1行に整理して表示するユーティリティ行。
 */
function InfoRow({
  icon: Icon,
  label,
  value,
  actionLabel,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-slate-400" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2 font-medium text-slate-800">
        <span>{value}</span>
        {actionLabel ? (
          <button type="button" className="text-emerald-600">
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
