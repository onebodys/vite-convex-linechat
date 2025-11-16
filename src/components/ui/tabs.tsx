import * as RadixTabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = RadixTabs.Root;

function TabsList({ className, ...props }: RadixTabs.TabsListProps) {
  return (
    <RadixTabs.List
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-500",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: RadixTabs.TabsTriggerProps) {
  return (
    <RadixTabs.Trigger
      className={cn(
        "min-w-0 rounded-full px-3 py-1 transition focus-visible:outline-none data-[state=active]:bg-white data-[state=active]:text-emerald-600",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: RadixTabs.TabsContentProps) {
  return (
    <RadixTabs.Content className={cn("mt-3 focus-visible:outline-none", className)} {...props} />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
