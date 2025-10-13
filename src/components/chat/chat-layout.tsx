import { useAction } from "convex/react";
import { Plus, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";
import { ChatSidebar } from "./chat-sidebar";
import { ConversationHeader } from "./conversation-header";
import { ConversationTimeline } from "./conversation-timeline";
import { useLineContacts } from "./hooks/use-line-contacts";
import { useLineMessages } from "./hooks/use-line-messages";
import { MessageComposer } from "./message-composer";
import { formatContactTag } from "./utils";

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
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!activeContactId || text.trim().length === 0) {
      return;
    }
    setIsSending(true);
    try {
      await sendTextMessage({ lineUserId: activeContactId, text });
    } catch (error) {
      console.error("Failed to send message", error);
      // TODO: surface error to UI (toast/snackbar) if needed
    } finally {
      setIsSending(false);
    }
  };

  const subtitle = activeContact ? `LINE ・ ${activeContact.lastMessageAt ?? "---"}` : "";

  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-br from-slate-100 via-white to-slate-200">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-6 rounded-[40px] border border-border/50 bg-white/80 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.45)] backdrop-blur-xl">
          <header className="flex items-center justify-between rounded-3xl border border-border/60 bg-muted/40 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                LINE オペレーション
              </p>
              <h1 className="text-2xl font-semibold text-foreground">会話ダッシュボード</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Plus className="mr-2 size-4" />
                新規チャット
              </Button>
              <Button variant="ghost" size="icon" className="rounded-2xl">
                <Settings className="size-5" />
                <span className="sr-only">設定を開く</span>
              </Button>
            </div>
          </header>

          <div className="grid flex-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <ChatSidebar
              contacts={contactList}
              isLoading={isLoading}
              activeContactId={activeContactId ?? undefined}
              onSelectContact={(contact) => setSelectedContactId(contact.id)}
            />

            <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border/60 bg-white/90 shadow-xl">
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
                      activeContact.tags?.[0] ? formatContactTag(activeContact.tags[0]) : undefined
                    }
                  />

                  <ConversationTimeline messages={messages} isLoading={isLoadingMessages} />

                  <div className="border-t border-border/70 bg-muted/40 px-6 py-4">
                    <MessageComposer
                      onSend={handleSendMessage}
                      disabled={!activeContactId}
                      isSubmitting={isSending}
                    />
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyConversationState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center text-muted-foreground">
      <div className="rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em]">
        会話がありません
      </div>
      <p className="max-w-sm text-sm text-muted-foreground/80">
        現在表示できる LINE
        ユーザーがいません。新しいフォローイベントを受信すると、ここに会話が表示されます。
      </p>
    </div>
  );
}

function LoadingConversationState() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12 text-sm text-muted-foreground">
      会話を読み込み中です…
    </div>
  );
}
