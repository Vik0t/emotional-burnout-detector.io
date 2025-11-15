"use client";

import * as React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { createPortal } from "react-dom";

import { cn } from "./utils";

function Menubar({ className, children, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav data-slot="menubar" className={cn("p-menubar bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs", className)} {...props}>
      <ul className="p-menubar-root-list flex gap-1 items-center">{children}</ul>
    </nav>
  );
}

function MenubarMenu({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const context = React.useMemo(() => ({ open, setOpen }), [open]);

  return (
    <li data-slot="menubar-menu" className="p-menuitem" role="presentation">
      <MenubarMenuContext.Provider value={context}>{children}</MenubarMenuContext.Provider>
    </li>
  );
}

const MenubarMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function MenubarGroup({ children, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="menubar-group" {...props}>{children}</div>;
}

function MenubarPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function MenubarRadioGroup({ children, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="menubar-radio-group" {...props}>{children}</div>;
}

function MenubarTrigger({ children, className, ...props }: React.ComponentProps<"button">) {
  const ctx = React.useContext(MenubarMenuContext);
  if (!ctx) return null;
  const { open, setOpen } = ctx;
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  const toggle = (e?: any) => {
    setOpen(!open);
    props.onClick?.(e as any);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
    props.onKeyDown?.(e);
  };

  return (
    <button
      ref={buttonRef}
      data-slot="menubar-trigger"
      aria-haspopup="menu"
      aria-expanded={open}
      className={cn(
        "p-menuitem-content p-menuitem-link focus:bg-accent focus:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className,
      )}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <span className="p-menuitem-text">{children}</span>
    </button>
  );
}

function MenubarContent({ children, className, ...props }: React.ComponentProps<"div">) {
  const ctx = React.useContext(MenubarMenuContext);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const root = React.useRef<HTMLDivElement | null>(null);
  if (!ctx) return null;
  const { open, setOpen } = ctx;

  React.useEffect(() => {
    const el = containerRef.current;
    const handleClick = (e: MouseEvent) => {
      if (!el || el.contains(e.target as Node)) return;
      setOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const handleKeyArrow = (e: KeyboardEvent) => {
      const items = containerRef.current?.querySelectorAll<HTMLElement>(
        'button[data-slot="menubar-item"], button[data-slot="menubar-checkbox-item"], button[data-slot="menubar-radio-item"], a[data-slot="menubar-link"]'
      );
      if (!items || items.length === 0) return;
      const idx = Array.prototype.indexOf.call(items, document.activeElement as any);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (idx + 1) % items.length;
        items[next].focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (idx - 1 + items.length) % items.length;
        items[prev].focus();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keydown", handleKeyArrow);
    }
    return () => {
  document.removeEventListener("mousedown", handleClick);
  document.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("keydown", handleKeyArrow);
    };
  }, [open, setOpen]);

  if (!open) return null;

  const node = (
    <div data-slot="menubar-content" className={cn("p-overlaypanel bg-popover text-popover-foreground z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md", className)} ref={containerRef} {...props}>
      <div className="p-overlaypanel-content">{children}</div>
    </div>
  );

  return createPortal(node, document.body);
}

function MenubarItem({ className, inset, variant = "default", children, ...props }: React.ComponentProps<"button"> & { inset?: boolean; variant?: "default" | "destructive" }) {
  const ctx = React.useContext(MenubarMenuContext);
  const handleClick = (e: any) => {
    props.onClick?.(e);
    if (ctx?.setOpen) ctx.setOpen(false);
  };
  return (
    <li data-slot="menubar-item" data-inset={inset} data-variant={variant} className={cn("p-menuitem", className)}>
      <button onClick={handleClick} className="p-menuitem-content p-menuitem-link flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm outline-hidden select-none" {...props}>{children}</button>
    </li>
  );
}

function MenubarCheckboxItem({ className, children, checked, onChange, ...props }: React.ComponentProps<"button"> & { checked?: boolean; onChange?: (c: boolean) => void }) {
  const handleClick = (e: any) => {
    onChange?.(!checked);
    props.onClick?.(e as any);
  };

  const ctx = React.useContext(MenubarMenuContext);
  const handleClick2 = (e: any) => {
    handleClick(e);
    if (ctx?.setOpen) ctx.setOpen(false);
  };
  return (
    <li data-slot="menubar-checkbox-item" className={cn("p-menuitem", className)}>
  <button onClick={handleClick2} aria-checked={checked} className="p-menuitem-content p-menuitem-link flex items-center gap-2 px-2 py-1.5 text-sm rounded-xs outline-hidden select-none" {...props}>
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">{checked && <CheckIcon className="size-4" />}</span>
        {children}
      </button>
    </li>
  );
}

function MenubarRadioItem({ className, children, checked = false, onChange, ...props }: React.ComponentProps<"button"> & { checked?: boolean; onChange?: (c: boolean) => void }) {
  const ctx = React.useContext(MenubarMenuContext);
  const handleClick = (e: any) => {
    onChange?.(!checked);
    props.onClick?.(e as any);
    if (ctx?.setOpen) ctx.setOpen(false);
  };

  return (
    <li data-slot="menubar-radio-item" className={cn("p-menuitem", className)}>
      <button onClick={handleClick} aria-checked={checked} className="p-menuitem-content p-menuitem-link flex items-center gap-2 px-2 py-1.5 text-sm rounded-xs outline-hidden select-none" {...props}>
        <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">{checked && <CircleIcon className="size-2 fill-current" />}</span>
        {children}
      </button>
    </li>
  );
}

function MenubarLabel({ className, inset, children, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div data-slot="menubar-label" data-inset={inset} className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)} {...props}>
      {children}
    </div>
  );
}

function MenubarSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="menubar-separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}

function MenubarShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="menubar-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />;
}

function MenubarSub({ children, ...props }: { children?: React.ReactNode }) {
  return <div data-slot="menubar-sub" {...props}>{children}</div>;
}

function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<"button"> & { inset?: boolean }) {
  return (
    <button data-slot="menubar-sub-trigger" data-inset={inset} className={cn("p-menuitem-content p-menuitem-link focus:bg-accent focus:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8", className)} {...props}>
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </button>
  );
}

function MenubarSubContent({ className, ...props }: { className?: string }) {
  return <div data-slot="menubar-sub-content" className={cn("bg-popover text-popover-foreground z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props} />;
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
