import { useMutation } from "convex/react";
import { Calendar, Plus, Tag, UserRound } from "lucide-react";
import { type ComponentType, type ReactNode, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useLineNotes } from "./hooks/use-line-notes";
import type { Contact, PinnedMessage } from "./types";

/**
 * @description 選択中の LINE ユーザー情報とメモ欄をまとめて表示するサイドパネル。
 */
export function ContactInspector({
  contact,
  pinnedMessages,
  onSelectPinnedMessage,
  onUnpinMessage,
}: {
  contact: Contact | null;
  pinnedMessages: PinnedMessage[];
  onSelectPinnedMessage: (messageId: Id<"messages">) => void;
  onUnpinMessage: (messageId: Id<"messages">) => void;
}) {
  const contactId = contact?.id ?? null;
  const { notes, isLoading: isLoadingNotes } = useLineNotes(contactId);
  const createNoteMutation = useMutation(api.line.notes.create);
  const removeNoteMutation = useMutation(api.line.notes.remove);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [removingNoteId, setRemovingNoteId] = useState<Id<"lineUserNotes"> | null>(null);

  if (!contact) {
    return (
      <aside className="hidden h-full w-80 min-h-0 flex-col border-l border-slate-200 bg-white/70 px-5 py-6 text-sm text-slate-500 lg:flex">
        <p className="text-center text-xs">ユーザーを選択すると詳細が表示されます。</p>
      </aside>
    );
  }

  const handleCreateNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSavingNote) {
      return;
    }
    const trimmed = noteDraft.trim();
    if (!trimmed) {
      setNoteError("ノートの内容を入力してください。");
      return;
    }
    if (notes.length >= 20) {
      setNoteError("ノートは20件までです。");
      return;
    }
    setIsSavingNote(true);
    setNoteError(null);
    try {
      await createNoteMutation({ lineUserId: contact.id, body: trimmed });
      setNoteDraft("");
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : "ノートの保存に失敗しました。");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleRemoveNote = async (noteId: Id<"lineUserNotes">) => {
    setRemovingNoteId(noteId);
    try {
      await removeNoteMutation({ noteId });
    } catch (error) {
      setNoteError(error instanceof Error ? error.message : "ノートの削除に失敗しました。");
    } finally {
      setRemovingNoteId(null);
    }
  };

  return (
    <aside className="hidden h-full w-80 min-h-0 flex-col overflow-y-auto border-l border-slate-200 bg-white px-5 py-6 text-sm text-slate-700 lg:flex">
      <section className="flex flex-col items-center gap-3 pb-6">
        <div className="relative inline-flex">
          <img
            src={contact.avatar}
            alt={contact.name}
            className="size-20 rounded-full border border-slate-200 bg-slate-100 object-cover"
          />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-900">{contact.name}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 pt-1 text-xs">
          {(contact.tags ?? ["未分類"]).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600"
            >
              <Tag className="size-3" />
              {tag}
            </span>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-3 py-1 font-medium text-slate-500 hover:border-slate-400"
          >
            <Plus className="size-3" />
            追加
          </button>
        </div>
      </section>

      <div className="my-3 border-b border-slate-200" />

      <Tabs defaultValue="basic" className="flex-1">
        <TabsList className="mb-3 grid grid-cols-3 gap-1 rounded-full bg-slate-100 p-1">
          <TabsTrigger value="basic" className="rounded-full px-3 py-1 text-xs">
            基本情報
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-full px-3 py-1 text-xs">
            ノート
          </TabsTrigger>
          <TabsTrigger value="pin" className="rounded-full px-3 py-1 text-xs">
            ピン
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <SectionCard title="基本情報">
            <InfoRow icon={UserRound} label="担当者" value="くまがい" actionLabel="変更" />
            <InfoRow icon={Calendar} label="最終応対" value={contact.lastMessageAt || "---"} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="notes">
          <SectionCard title="ノート">
            <form className="space-y-3" onSubmit={handleCreateNote}>
              <textarea
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-emerald-400"
                rows={3}
                placeholder="ここにメモを入力"
                maxLength={300}
                value={noteDraft}
                onChange={(event) => {
                  setNoteDraft(event.target.value);
                  if (noteError) {
                    setNoteError(null);
                  }
                }}
                disabled={isSavingNote || notes.length >= 20}
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{noteDraft.length}/300 文字</span>
                <span>
                  {notes.length}/20 件{notes.length >= 20 ? " (上限)" : ""}
                </span>
              </div>
              {noteError ? <p className="text-xs text-rose-500">{noteError}</p> : null}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500/90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSavingNote || noteDraft.trim().length === 0 || notes.length >= 20}
                >
                  <Plus className="size-3" />
                  ノートを追加
                </button>
              </div>
            </form>
            <div className="mt-4 space-y-3">
              {isLoadingNotes ? (
                <p className="text-xs text-slate-500">ノートを読み込み中です…</p>
              ) : notes.length === 0 ? (
                <p className="text-xs text-slate-500">まだノートは登録されていません。</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-3 text-sm leading-relaxed text-slate-700 shadow-sm"
                  >
                    <p className="whitespace-pre-line">{note.body}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {new Date(note.createdAt).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                      <button
                        type="button"
                        className="text-rose-500"
                        onClick={() => handleRemoveNote(note._id)}
                        disabled={removingNoteId === note._id}
                      >
                        {removingNoteId === note._id ? "削除中…" : "削除"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="pin">
          <SectionCard title="ピン">
            {pinnedMessages.length === 0 ? (
              <p className="text-xs text-slate-500">ピン留めされたメッセージはまだありません。</p>
            ) : (
              <div className="space-y-3">
                {pinnedMessages.map((pin) => (
                  <div
                    key={pin.messageId}
                    className="flex items-start justify-between gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 text-xs text-slate-600 shadow-sm"
                  >
                    <button
                      type="button"
                      className="flex-1 text-left"
                      onClick={() => onSelectPinnedMessage(pin.messageId)}
                    >
                      <p className="font-semibold text-slate-800">{pin.previewText}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(pin.createdAt).toLocaleString("ja-JP", {
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-rose-500"
                      onClick={() => onUnpinMessage(pin.messageId)}
                    >
                      解除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
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
