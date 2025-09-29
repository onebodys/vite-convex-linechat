import {
  BadgeCheck,
  Filter,
  MoreVertical,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Smile,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type Contact,
  channels,
  contacts,
  type Message,
  quickReplies,
  timeline,
} from "./mock-data";

function ChannelPill({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      data-active={active}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        "border-border/70 bg-white/40 text-muted-foreground hover:bg-primary/10 hover:text-primary",
        "data-[active=true]:border-primary/70 data-[active=true]:bg-primary/10 data-[active=true]:text-primary",
      )}
    >
      {label}
    </button>
  );
}

function ContactRow({ contact, active }: { contact: Contact; active?: boolean }) {
  return (
    <button
      type="button"
      data-active={active}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition",
        "hover:border-primary/20 hover:bg-primary/5",
        active ? "border-primary/30 bg-primary/10" : "bg-white/40",
      )}
    >
      <div className="relative mt-1 h-12 w-12 overflow-hidden rounded-2xl bg-muted">
        <img
          alt={contact.name}
          src={contact.avatar}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {contact.pinned ? (
          <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            ★
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{contact.name}</p>
            <p className="text-xs text-muted-foreground">{contact.handle}</p>
          </div>
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {contact.lastMessageAt}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground/80">{contact.lastMessage}</p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
              contact.channel === "line"
                ? "bg-lime-100 text-lime-600"
                : contact.channel === "instagram"
                  ? "bg-pink-100 text-pink-600"
                  : "bg-sky-100 text-sky-600",
            )}
          >
            {contact.channel === "line" ? "LINE" : contact.channel === "email" ? "メール" : "SNS"}
          </span>
          {contact.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {contact.unreadCount ? (
            <span className="ml-auto inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {contact.unreadCount}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.author === "agent";
  return (
    <div
      className={cn("flex gap-3", isAgent ? "flex-row-reverse" : "flex-row")}
      data-side={isAgent ? "agent" : "customer"}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-sm font-medium text-muted-foreground">
        {isAgent ? "OP" : "GU"}
      </div>
      <div
        className={cn("max-w-[70%] space-y-2", isAgent && "items-end text-right")}
        data-side={isAgent ? "agent" : "customer"}
      >
        <div
          className={cn(
            "rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm",
            isAgent ? "ml-auto bg-primary text-primary-foreground" : "bg-white text-foreground",
          )}
        >
          <p>{message.content}</p>
          {message.attachments?.length ? (
            <div className="mt-3 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border px-3 py-2",
                    isAgent
                      ? "border-primary/40 bg-primary/20 text-primary-foreground"
                      : "border-border bg-muted/60 text-muted-foreground",
                  )}
                >
                  <div className="flex size-9 items-center justify-center rounded-xl bg-black/10 text-xs font-semibold uppercase">
                    {attachment.type === "image" ? "IMG" : "PDF"}
                  </div>
                  <div className="flex-1 text-left text-xs">
                    <p className="font-medium">{attachment.name}</p>
                    {attachment.size ? (
                      <p className="text-muted-foreground/80">{attachment.size}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className={cn(
                      "text-xs font-semibold",
                      isAgent ? "text-primary-foreground/80" : "text-primary",
                    )}
                  >
                    ダウンロード
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "flex items-center gap-2 text-xs text-muted-foreground",
            isAgent && "justify-end",
          )}
        >
          <span>{message.sentAt}</span>
          {isAgent && message.status ? (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="size-3" />
              {message.status === "read"
                ? "既読"
                : message.status === "delivered"
                  ? "配信済み"
                  : "送信済み"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ChatLayout() {
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
            <aside className="hidden flex-col gap-6 rounded-3xl border border-border/60 bg-white/75 p-5 shadow-inner lg:flex">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="w-full rounded-full border border-border/60 bg-white/80 px-10 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
                    placeholder="名前・タグ・メモで検索"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    <Filter className="size-3.5" />
                    フィルター
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {channels.map((channel) => (
                    <ChannelPill
                      key={channel.id}
                      label={channel.label}
                      active={channel.id === "all"}
                    />
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {contacts.map((contact, index) => (
                  <ContactRow key={contact.id} contact={contact} active={index === 0} />
                ))}
              </div>
            </aside>

            <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border/60 bg-white/90 shadow-xl">
              <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    現在の会話
                  </p>
                  <div className="mt-1 flex items-center gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">佐藤 花</h2>
                      <p className="text-sm text-muted-foreground">LINE ・ 3分前に返信</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-lime-600">
                      優先対応
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-2xl">
                    <Phone className="size-5" />
                    <span className="sr-only">音声通話</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-2xl">
                    <Video className="size-5" />
                    <span className="sr-only">ビデオ通話</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-2xl">
                    <MoreVertical className="size-5" />
                    <span className="sr-only">その他の操作</span>
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <div className="mx-auto flex w-fit items-center gap-3 rounded-full border border-border/60 bg-white/80 px-4 py-1 text-xs text-muted-foreground">
                  <span className="font-semibold">今日</span>
                  <div className="size-1 rounded-full bg-muted-foreground/50" />
                  <span>9 月 29 日</span>
                </div>
                <div className="space-y-6">
                  {timeline.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-border/70 bg-muted/40 px-6 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    クイック返信
                  </span>
                  {quickReplies.map((reply) => (
                    <button
                      type="button"
                      key={reply}
                      className="rounded-full border border-border/60 bg-white/80 px-4 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
                <form className="flex items-end gap-3 rounded-3xl border border-border/70 bg-white/90 p-3 shadow-sm">
                  <div className="flex flex-col gap-2">
                    <Button type="button" variant="ghost" size="icon" className="rounded-2xl">
                      <Paperclip className="size-5" />
                      <span className="sr-only">ファイル添付</span>
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="rounded-2xl">
                      <Smile className="size-5" />
                      <span className="sr-only">スタンプ</span>
                    </Button>
                  </div>
                  <label className="flex flex-1 flex-col gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      返信メッセージ
                    </span>
                    <textarea
                      className="min-h-[96px] w-full resize-none rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-foreground shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
                      placeholder="メッセージを入力..."
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>外部公開メッセージ</span>
                      <span>Shift + Enter で改行</span>
                    </div>
                  </label>
                  <div className="flex flex-col items-center gap-2">
                    <Button type="button" variant="ghost" size="icon" className="rounded-2xl">
                      <Plus className="size-5" />
                      <span className="sr-only">テンプレートを挿入</span>
                    </Button>
                    <Button type="submit" className="rounded-2xl px-5">
                      送信
                      <Send className="ml-2 size-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
