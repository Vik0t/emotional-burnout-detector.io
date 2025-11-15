"use client";

import * as React from "react";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";
import { createPortal } from "react-dom";

type ContextMenuState = {
  open: boolean;
  x: number;
  y: number;
};

/**
 * ContextMenu
 * Usage:
 *  <ContextMenu>
 *    <ContextMenuTrigger><button>...</button></ContextMenuTrigger>
 *    <ContextMenuContent>
 *      <ContextMenuItem onClick={...}>Action</ContextMenuItem>
 *      <ContextMenuCheckboxItem checked={bool} onChange={(v)=>...}>Toggle</ContextMenuCheckboxItem>
 *    </ContextMenuContent>
 *  </ContextMenu>
 *
 * The content will open at the cursor position for right-click or at the element position for the keyboard context menu.
 * Keyboard support: ArrowUp/ArrowDown/Home/End/Enter/Escape and ContextMenu key / Shift+F10 to open.
 */
const ContextMenuContext = React.createContext<{
  state: ContextMenuState;
  setState: (s: ContextMenuState) => void;
} | null>(null);

function ContextMenu({ children }: { children?: React.ReactNode }) {
  const [state, setState] = React.useState<ContextMenuState>({ open: false, x: 0, y: 0 });
  return <ContextMenuContext.Provider value={{ state, setState }}>{children}</ContextMenuContext.Provider>;
}

function ContextMenuTrigger({ children, className, ...props }: any) {
  const ctx = React.useContext(ContextMenuContext);
  if (!ctx) return null;

  const child = React.Children.only(children) as React.ReactElement<any>;
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    ctx.setState({ open: true, x: e.clientX, y: e.clientY });
    child.props?.onContextMenu?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Context menu key or Shift+F10 opens context menu for keyboard navigation
    if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey)) {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      ctx.setState({ open: true, x: Math.round(rect.left + 8), y: Math.round(rect.top + 8) });
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };

  return React.cloneElement(child, {
    className: cn(child.props.className, className),
    onContextMenu: handleContextMenu,
    onKeyDown: handleKeyDown,
    ...props,
  });
}

function ContextMenuPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function ContextMenuContent({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
  const ctx = React.useContext(ContextMenuContext);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const focusIndexRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!ctx) return;
    if (!ctx.state.open) return;
    const el = containerRef.current;
    const handleClick = (e: MouseEvent) => {
      if (!el || el.contains(e.target as Node)) return;
      ctx.setState({ ...ctx.state, open: false });
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setState({ ...ctx.state, open: false });
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      const items = el?.querySelectorAll<HTMLElement>(
        'button[data-slot="context-menu-item"], button[data-slot="context-menu-checkbox-item"], button[data-slot="context-menu-radio-item"], button[data-slot="context-menu-sub-trigger"]'
      );
      if (!items || items.length === 0) return;

      const idx = Array.prototype.indexOf.call(items, document.activeElement as any);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (idx + 1) % items.length;
        items[next].focus();
        focusIndexRef.current = next;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (idx - 1 + items.length) % items.length;
        items[prev].focus();
        focusIndexRef.current = prev;
      } else if (e.key === "Home") {
        e.preventDefault();
        items[0].focus();
        focusIndexRef.current = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        items[items.length - 1].focus();
        focusIndexRef.current = items.length - 1;
      } else if (e.key === "Enter" || e.key === " ") {
        // Activate focused item
        (document.activeElement as HTMLElement | null)?.click();
      }
    };
    // After opening, focus the first item so keyboard navigation begins on it
    const items = el?.querySelectorAll<HTMLElement>(
      'button[data-slot="context-menu-item"], button[data-slot="context-menu-checkbox-item"], button[data-slot="context-menu-radio-item"], button[data-slot="context-menu-sub-trigger"]'
    );
    if (items && items.length > 0) {
      // Focus after event loop to ensure portal ref exists
      setTimeout(() => {
        items[0].focus();
        focusIndexRef.current = 0;
      }, 0);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ctx?.state.open]);

  if (!ctx || !ctx.state.open) return null;

  const style: React.CSSProperties = { position: "absolute", left: ctx.state.x, top: ctx.state.y };

  return createPortal(
    <div
      data-slot="context-menu-content"
      role="menu"
      aria-orientation="vertical"
      style={style}
      tabIndex={-1}
      className={cn("p-overlaypanel", className)}
    ref={containerRef}
    {...props}
    >
      <div className="p-overlaypanel-content">{children}</div>
    </div>,
    document.body,
  );
}

function ContextMenuGroup({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="context-menu-group" role="group" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function ContextMenuRadioGroup({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="context-menu-radio-group" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function ContextMenuItem({ className, inset, variant = "default", children, closeOnSelect = true, disabled, ...props }: React.ComponentProps<"button"> & { inset?: boolean; variant?: "default" | "destructive"; closeOnSelect?: boolean; disabled?: boolean }) {
  const ctx = React.useContext(ContextMenuContext);
  const handleClick = (e: any) => {
    if (disabled) return;
    if (props.onClick) props.onClick(e);
    if (ctx && closeOnSelect) ctx.setState({ ...ctx.state, open: false });
  };
  return (
    <button
      data-slot="context-menu-item"
  role="menuitem"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
  onClick={handleClick}
  {...props}
    >
      {children}
    </button>
  );
}

function ContextMenuCheckboxItem({ className, children, checked, onChange, closeOnSelect = true, disabled, ...props }: React.ComponentProps<"button"> & { checked?: boolean; onChange?: (checked: boolean) => void; closeOnSelect?: boolean; disabled?: boolean }) {
  const ctx = React.useContext(ContextMenuContext);
  const handleClick = (e: any) => {
    onChange?.(!checked);
    if (props.onClick) props.onClick(e);
    if (ctx && closeOnSelect) ctx.setState({ ...ctx.state, open: false });
  };

  return (
    <button
      data-slot="context-menu-checkbox-item"
      role="menuitemcheckbox"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
  aria-disabled={disabled}
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

function ContextMenuRadioItem({ className, children, checked = false, onChange, closeOnSelect = true, disabled, ...props }: React.ComponentProps<"button"> & { checked?: boolean; onChange?: (checked: boolean) => void; closeOnSelect?: boolean; disabled?: boolean }) {
  const ctx = React.useContext(ContextMenuContext);
  const handleClick = (e: any) => {
    onChange?.(!checked);
    props.onClick?.(e as any);
    if (ctx && closeOnSelect) ctx.setState({ ...ctx.state, open: false });
  };

  return (
    <button
      data-slot="context-menu-radio-item"
      role="menuitemradio"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
  aria-disabled={disabled}
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

function ContextMenuLabel({ className, inset, children, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) {
  return (
    <div data-slot="context-menu-label" role="presentation" data-inset={inset} className={cn("text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)} {...props}>
      {children}
    </div>
  );
}

function ContextMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="context-menu-separator" role="separator" className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="context-menu-shortcut" className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />;
}

function ContextMenuSub({ children, ...props }: { children?: React.ReactNode }) {
  return <div data-slot="context-menu-sub" {...props}>{children}</div>;
}

function ContextMenuSubTrigger({ className, inset, children, closeOnSelect = true, ...props }: React.ComponentProps<"button"> & { inset?: boolean; closeOnSelect?: boolean }) {
  return (
    <button data-slot="context-menu-sub-trigger" data-inset={inset} aria-haspopup="menu" className={cn("focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props}>
      {children}
      <ChevronRightIcon className="ml-auto" />
    </button>
  );
}

function ContextMenuSubContent({ className, ...props }: { className?: string }) {
  return (
    <div data-slot="context-menu-sub-content" role="menu" className={cn("bg-popover text-popover-foreground z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg", className)} {...props} />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
