import { useAction } from "convex/react";
import { Bell, CircleHelp, MessageSquare, PieChart, Settings, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ChatSidebar } from "./chat-sidebar";
import { ContactInspector } from "./contact-inspector";
import { ConversationHeader } from "./conversation-header";
import { ConversationTimeline } from "./conversation-timeline";
import { useLineContacts } from "./hooks/use-line-contacts";
import { useLineMessages } from "./hooks/use-line-messages";
import { MessageComposer } from "./message-composer";
import type { PinnedMessage, TimelineEntry } from "./types";
import { formatContactTag, getTimelineEntryPreview } from "./utils";

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
  const [pinnedMessagesByContact, setPinnedMessagesByContact] = useState<
    Record<string, PinnedMessage[]>
  >({});
  const [scrollTargetMessageId, setScrollTargetMessageId] = useState<Id<"messages"> | null>(null);

  const activePinnedMessages = activeContactId
    ? (pinnedMessagesByContact[activeContactId] ?? [])
    : [];
  const pinnedMessageIdSet = useMemo(
    () => new Set(activePinnedMessages.map((pin) => pin.messageId)),
    [activePinnedMessages],
  );

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

  const handlePinMessage = (entry: TimelineEntry) => {
    if (!activeContactId) {
      return;
    }
    setPinnedMessagesByContact((prev) => {
      const current = prev[activeContactId] ?? [];
      if (current.some((pin) => pin.messageId === entry.message._id)) {
        return prev;
      }
      const nextPin: PinnedMessage = {
        messageId: entry.message._id,
        lineMessageId: entry.message.lineMessageId,
        previewText: getTimelineEntryPreview(entry),
        createdAt: entry.message.createdAt,
      };
      return { ...prev, [activeContactId]: [...current, nextPin] };
    });
  };

  const handleUnpinMessage = (messageId: Id<"messages">) => {
    if (!activeContactId) {
      return;
    }
    setPinnedMessagesByContact((prev) => {
      const current = prev[activeContactId] ?? [];
      const nextList = current.filter((pin) => pin.messageId !== messageId);
      return { ...prev, [activeContactId]: nextList };
    });
  };

  const handleSelectPinnedMessage = (messageId: Id<"messages">) => {
    setScrollTargetMessageId(messageId);
  };

  return (
    <div className="flex h-svh w-full overflow-hidden bg-[#f5f7fb] text-slate-700">
      <NavigationRail />
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <ChatSidebar
            contacts={contactList}
            isLoading={isLoading}
            activeContactId={activeContactId ?? undefined}
            onSelectContact={(contact) => setSelectedContactId(contact.id)}
          />

          <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r border-slate-200 bg-white">
            {isEmptyState ? (
              <EmptyConversationState />
            ) : !activeContactId || !activeContact ? (
              <LoadingConversationState />
            ) : (
              <>
                <ConversationHeader
                  title={activeContact.name}
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
                  participantAvatar={activeContact.avatar}
                  participantName={activeContact.name}
                  pinnedMessageIds={pinnedMessageIdSet}
                  onPinMessage={handlePinMessage}
                  onUnpinMessage={handleUnpinMessage}
                  scrollTargetMessageId={scrollTargetMessageId}
                  onScrollTargetAcknowledged={() => setScrollTargetMessageId(null)}
                />

                <footer className="shrink-0 border-t border-slate-200 bg-[#f7f8fb] px-8 py-5">
                  <MessageComposer
                    onSend={handleSendMessage}
                    disabled={!activeContactId}
                    isSubmitting={isSending}
                  />
                </footer>
              </>
            )}
          </section>

          <ContactInspector
            contact={activeContact}
            pinnedMessages={activePinnedMessages}
            onSelectPinnedMessage={handleSelectPinnedMessage}
            onUnpinMessage={handleUnpinMessage}
          />
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
    { icon: UserRound, label: "友だち", active: false },
    { icon: PieChart, label: "分析", active: false },
    { icon: Settings, label: "設定", active: false },
  ] as const;

  return (
    <aside className="hidden h-full w-16 flex-col border-r border-slate-200 bg-white/95 pb-6 pt-4 text-slate-500 shadow-sm lg:flex">
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
