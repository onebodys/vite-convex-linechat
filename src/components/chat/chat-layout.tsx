import { useAction } from "convex/react";
import { Bell, CircleHelp, MessageSquare, PieChart, Plus, Settings, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ChatSidebar } from "./chat-sidebar";
import { ContactInspector } from "./contact-inspector";
import { ConversationHeader } from "./conversation-header";
import { ConversationTimeline } from "./conversation-timeline";
import { useLineContacts } from "./hooks/use-line-contacts";
import { useLineMessages } from "./hooks/use-line-messages";
import { MessageComposer } from "./message-composer";
import { formatContactTag } from "./utils";

/**
 * @description LINE公式アカウントマネージャ風の 3 カラムUIを統括するレイアウトコンポーネント。
 */
export function ChatLayout() {
  const { contacts, isLoading } = useLineContacts();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const contactList = contacts ?? [];

  const activeContactId = useMemo(() => {
    if (contactList.length === 0) {
      return null;
    }
    if (selectedContactId && contactList.some((contact) => contact.id === selectedContactId)) {
      return selectedContactId;
    }
    return contactList[0]?.id ?? null;
  }, [contactList, selectedContactId]);

  const activeContact = contactList.find((contact) => contact.id === activeContactId) ?? null;

  const isEmptyState = !isLoading && contactList.length === 0;
  const { messages, isLoading: isLoadingMessages } = useLineMessages(activeContactId);

  const sendTextMessage = useAction(api.line.actions.sendTextMessage);
  const resendTextMessage = useAction(api.line.actions.resendTextMessage);
  const [isSending, setIsSending] = useState(false);
  const [retryingMessageIds, setRetryingMessageIds] = useState<Set<Id<"messages">>>(new Set());

  const handleSendMessage = async (text: string) => {
    if (!activeContactId || text.trim().length === 0) {
      return;
    }
    setIsSending(true);
    try {
      await sendTextMessage({ lineUserId: activeContactId, text });
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleRetryMessage = async (messageId: Id<"messages">) => {
    setRetryingMessageIds((prev) => {
      const next = new Set(prev);
      next.add(messageId);
      return next;
    });

    try {
      await resendTextMessage({ messageId });
    } catch (error) {
      console.error("Failed to resend message", error);
    } finally {
      setRetryingMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        return next;
      });
    }
  };

  const subtitle = activeContact ? `LINE ・ ${activeContact.lastMessageAt ?? "---"}` : "";

  return (
    <div className="flex min-h-svh w-full bg-[#f5f7fb] text-slate-700">
      <NavigationRail />
      <div className="flex flex-1 flex-col">
        <OperatorHeader activeContactName={activeContact?.name} />
        <div className="flex flex-1 overflow-hidden">
          <ChatSidebar
            contacts={contactList}
            isLoading={isLoading}
            activeContactId={activeContactId ?? undefined}
            onSelectContact={(contact) => setSelectedContactId(contact.id)}
          />

          <section className="flex min-w-0 flex-1 flex-col border-r border-slate-200 bg-white">
            {isEmptyState ? (
              <EmptyConversationState />
            ) : !activeContactId || !activeContact ? (
              <LoadingConversationState />
            ) : (
              <>
                <ConversationHeader
                  title={activeContact.name}
                  subtitle={subtitle}
                  badgeLabel={
                    activeContact.lastMessageDirection
                      ? formatContactTag(activeContact.lastMessageDirection)
                      : activeContact.tags?.[0]
                        ? formatContactTag(activeContact.tags[0])
                        : undefined
                  }
                />

                <ConversationTimeline
                  messages={messages}
                  isLoading={isLoadingMessages}
                  onRetryMessage={handleRetryMessage}
                  retryingMessageIds={retryingMessageIds}
                />

                <footer className="border-t border-slate-200 bg-[#f7f8fb] px-8 py-5">
                  <MessageComposer
                    onSend={handleSendMessage}
                    disabled={!activeContactId}
                    isSubmitting={isSending}
                  />
                </footer>
              </>
            )}
          </section>

          <ContactInspector contact={activeContact} />
        </div>
      </div>
    </div>
  );
}

/**
 * @description ユーザーが存在しない場合の中央プレースホルダー。
 */
function EmptyConversationState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center text-slate-400">
      <div className="rounded-full border border-dashed border-slate-300 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
        会話がありません
      </div>
      <p className="max-w-sm text-sm">
        新しいフォローイベントを受信すると会話が表示されます。LINE
        公式アカウントからテスト送信してください。
      </p>
    </div>
  );
}

/**
 * @description 選択待ち・データ取得中の状態を中央に表示するブロック。
 */
function LoadingConversationState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 text-sm text-slate-400">
      会話を読み込み中です…
    </div>
  );
}

/**
 * @description LINE Official Account Manager の左レールを模したナビゲーション。
 */
function NavigationRail() {
  const items = [
    { icon: MessageSquare, label: "チャット", active: true },
    { icon: UserRound, label: "友だち" },
    { icon: PieChart, label: "分析" },
    { icon: Settings, label: "設定" },
  ] as const;

  return (
    <aside className="hidden w-16 flex-col border-r border-slate-200 bg-white/95 pb-6 pt-4 text-slate-500 shadow-sm lg:flex">
      <div className="flex flex-col items-center gap-1 pb-6">
        <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600">
          LINE
        </div>
        <span className="text-[10px] text-slate-400">Official</span>
      </div>
      <nav className="flex flex-1 flex-col items-center gap-3">
        {items.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            type="button"
            className={`flex size-11 items-center justify-center rounded-2xl border text-slate-500 transition hover:text-emerald-600 ${
              active ? "border-emerald-500/40 bg-emerald-50 text-emerald-600" : "border-transparent"
            }`}
          >
            <Icon className="size-5" />
            <span className="sr-only">{label}</span>
          </button>
        ))}
      </nav>
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <button type="button" className="rounded-full border border-slate-200 p-2">
          <Bell className="size-4" />
          <span className="sr-only">通知</span>
        </button>
        <button type="button" className="rounded-full border border-slate-200 p-2">
          <CircleHelp className="size-4" />
          <span className="sr-only">ヘルプ</span>
        </button>
      </div>
    </aside>
  );
}

/**
 * @description 画面上部のアカウント情報・操作ボタン類をまとめたヘッダー。
 */
function OperatorHeader({ activeContactName }: { activeContactName?: string }) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-400">
          LINE Official Account Manager
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">convex-example</h1>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            稼働中
          </span>
          {activeContactName ? (
            <span className="text-xs text-slate-500">選択中: {activeContactName}</span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-1 text-slate-600 transition hover:bg-slate-50"
        >
          更新
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-1 text-slate-600 transition hover:bg-slate-50"
        >
          対応方針
        </button>
        <Button className="rounded-full bg-emerald-500 px-5 py-2 text-white hover:bg-emerald-500/90">
          <Plus className="mr-2 size-4" />
          新規メッセージ
        </Button>
      </div>
    </header>
  );
}
