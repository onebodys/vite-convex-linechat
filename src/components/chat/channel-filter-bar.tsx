import { cn } from "@/lib/utils";

type ChannelOption = {
  id: string;
  label: string;
};

export type ChannelFilterBarProps = {
  channels: ChannelOption[];
  activeChannelId: string;
  onSelectChannel?: (id: string) => void;
};

function ChannelPill({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
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

export function ChannelFilterBar({
  channels,
  activeChannelId,
  onSelectChannel,
}: ChannelFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {channels.map((channel) => (
        <ChannelPill
          key={channel.id}
          label={channel.label}
          active={channel.id === activeChannelId}
          onClick={() => onSelectChannel?.(channel.id)}
        />
      ))}
    </div>
  );
}
