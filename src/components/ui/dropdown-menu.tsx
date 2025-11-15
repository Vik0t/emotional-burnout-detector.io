"use client";

import * as React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

function DropdownMenu({ children, className, ...props }: React.ComponentProps<typeof Popover> & { className?: string }) {
  return (
    <Popover data-slot="dropdown-menu" className={cn(className)} {...props}>
      {children}
    </Popover>
  );
}

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuTrigger({ children, className, ...props }: any) {
  return (
    <PopoverTrigger data-slot="dropdown-menu-trigger" className={cn(className)} {...props}>
      {children}
    </PopoverTrigger>
  );
}

function DropdownMenuContent({
  className,
  side = "bottom",
  align = "center",
  offset = 4,
  children,
  hidden,
  ...props
}: {
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  offset?: number;
  children?: React.ReactNode;
  hidden?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const handleKey = (e: KeyboardEvent) => {
      const items = Array.from(el.querySelectorAll('[data-slot="dropdown-menu-item"]')) as HTMLElement[];
      if (!items.length) return;
      const index = items.findIndex((i) => i === document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = items[(index + 1) % items.length];
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = items[(index - 1 + items.length) % items.length];
        prev?.focus();
      } else if (e.key === "Escape") {
        el.blur();
      }
    };
    el.addEventListener("keydown", handleKey);
    return () => el.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <PopoverContent
      className={cn("p-overlaypanel", className)}
      data-side={side}
      data-align={align}
      {...(props as any)}
    >
      <div ref={containerRef} className="p-overlaypanel-content">
        {children}
      </div>
    </PopoverContent>
  );
}

function DropdownMenuGroup({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="dropdown-menu-group" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function DropdownMenuItem({ className, inset, variant = "default", children, ...props }: React.ComponentProps<"button"> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return (
    <button
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuCheckboxItem({ className, children, checked, onChange, ...props }: React.ComponentProps<"button"> & { checked?: boolean; onChange?: (checked: boolean) => void }) {
  const handleClick = (e: any) => {
    onChange?.(!checked);
    if (props.onClick) props.onClick(e);
  };

  return (
    <button
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      aria-checked={checked}
      onClick={handleClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4" />}
      </span>
      {children}
    </button>
  );
}

function DropdownMenuRadioGroup({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="dropdown-menu-radio-group" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function DropdownMenuRadioItem({ className, checked = false, children, onChange, ...props }: React.ComponentProps<"button"> & { checked?: boolean; onChange?: (checked: boolean) => void }) {
  const handleClick = (e: any) => {
    onChange?.(!checked);
    props.onClick?.(e as any);
  };

  return (
    <button
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      aria-checked={checked}
      onClick={handleClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CircleIcon className="size-2 fill-current" />}
      </span>
      {children}
    </button>
  );
}

function DropdownMenuLabel({ className, inset, children, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div data-slot="dropdown-menu-label" data-inset={inset} className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)} {...props}>
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="dropdown-menu-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />;
}

function DropdownMenuSub({ children, ...props }: { children?: React.ReactNode }) {
  return <div data-slot="dropdown-menu-sub" {...props}>{children}</div>;
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<"button"> & { inset?: boolean }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      el.click();
    }
    if (props.onKeyDown) props.onKeyDown(e as any);
  };
  return (
    <button data-slot="dropdown-menu-sub-trigger" data-inset={inset} className={cn("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8", className)} onKeyDown={handleKeyDown} {...props}>
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </button>
  );
}

function DropdownMenuSubContent({ className, ...props }: { className?: string }) {
  return (
    <div data-slot="dropdown-menu-sub-content" className={cn("bg-popover text-popover-foreground z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props} />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
