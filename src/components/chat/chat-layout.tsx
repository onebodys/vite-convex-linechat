import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatSidebar } from "./chat-sidebar";
import { ConversationHeader } from "./conversation-header";
import { ConversationTimeline } from "./conversation-timeline";
import { useLineContacts } from "./hooks/use-line-contacts";
import { MessageComposer } from "./message-composer";
import { channels, contacts as mockContacts, timeline } from "./mock-data";

export function ChatLayout() {
  const { contacts, isLoading } = useLineContacts();
  const sidebarContacts = contacts ?? [];
  const activeContact = contacts === undefined ? mockContacts[0] : contacts[0];
  const isEmptyState = contacts !== undefined && contacts.length === 0;

  const displayContact = activeContact ?? mockContacts[0];
  const subtitleChannel =
    displayContact.channel === "line"
      ? "LINE"
      : displayContact.channel === "email"
        ? "メール"
        : "SNS";
  const subtitle = `${subtitleChannel} ・ ${displayContact.lastMessageAt ?? "---"}`;

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
              contacts={sidebarContacts}
              isLoading={isLoading}
              channels={channels}
              activeContactId={activeContact.id}
            />

            <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border/60 bg-white/90 shadow-xl">
              {isEmptyState ? (
                <EmptyConversationState />
              ) : (
                <>
                  <ConversationHeader
                    title={displayContact.name}
                    subtitle={subtitle}
                    badgeLabel={displayContact.tags?.[0]}
                  />

                  <ConversationTimeline messages={timeline} />

                  <div className="border-t border-border/70 bg-muted/40 px-6 py-4">
                    <MessageComposer />
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
