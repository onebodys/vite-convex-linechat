import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuContent = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) => (
  <DropdownMenuPrimitive.Content
    className={cn(
      "z-50 min-w-[180px] rounded-xl border border-slate-200 bg-white p-1 text-sm text-slate-700 shadow-xl focus:outline-none",
      className,
    )}
    sideOffset={8}
    {...props}
  />
);

const DropdownMenuItem = ({ className, ...props }: DropdownMenuPrimitive.DropdownMenuItemProps) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 outline-none transition hover:bg-slate-100 focus:bg-slate-100",
      className,
    )}
    {...props}
  />
);

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
};
