import { MoreVertical, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ConversationHeaderProps = {
  title: string;
  subtitle: string;
  badgeLabel?: string;
};

export function ConversationHeader({ title, subtitle, badgeLabel }: ConversationHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">現在の会話</p>
        <div className="mt-1 flex items-center gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {badgeLabel ? (
            <span className="inline-flex items-center rounded-full bg-lime-100 px-2.5 py-1 text-xs font-semibold text-lime-600">
              {badgeLabel}
            </span>
          ) : null}
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
  );
}
