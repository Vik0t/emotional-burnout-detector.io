"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "./utils";

type HoverCardContextValue = {
  open: boolean;
  show: () => void;
  hide: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null);

function HoverCard({ children }: { children?: React.ReactNode }) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  const show = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
  }, []);
  const hide = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = window.setTimeout(() => setOpen(false), 100);
  }, []);

  return (
    <HoverCardContext.Provider value={{ open, show, hide, triggerRef }}>
      {children}
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({ children, asChild, ...props }: any) {
  const ctx = React.useContext(HoverCardContext);
  if (!ctx) return null;
  const child = React.Children.only(children) as React.ReactElement<any>;
  const ref = (node: HTMLElement | null) => {
    ctx.triggerRef.current = node;
    const childRef = (child as any).ref;
    if (typeof childRef === "function") childRef(node);
    else if (childRef) childRef.current = node;
  };

  const onMouseEnter = (e: any) => {
    ctx.show();
    child.props?.onMouseEnter?.(e);
  };
  const onMouseLeave = (e: any) => {
    ctx.hide();
    child.props?.onMouseLeave?.(e);
  };
  const onFocus = (e: any) => {
    ctx.show();
    child.props?.onFocus?.(e);
  };
  const onBlur = (e: any) => {
    ctx.hide();
    child.props?.onBlur?.(e);
  };

  return React.cloneElement(child, {
    ref,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...props,
  });
}

function HoverCardContent({ className, children, side = "top", offset = 8 }: { className?: string; children?: React.ReactNode; side?: "top" | "right" | "bottom" | "left"; offset?: number }) {
  const ctx = React.useContext(HoverCardContext);
  if (!ctx || !ctx.open) return null;
  const node = ctx.triggerRef.current;
  if (!node) return null;
  const rect = node.getBoundingClientRect();
  const base: React.CSSProperties = { position: "absolute" };
  switch (side) {
    case "top":
      base.left = rect.left + rect.width / 2 + window.scrollX;
      base.top = rect.top + window.scrollY - offset;
      base.transform = "translate(-50%, -100%)";
      break;
    case "bottom":
      base.left = rect.left + rect.width / 2 + window.scrollX;
      base.top = rect.bottom + window.scrollY + offset;
      base.transform = "translate(-50%, 0)";
      break;
    case "left":
      base.left = rect.left + window.scrollX - offset;
      base.top = rect.top + rect.height / 2 + window.scrollY;
      base.transform = "translate(-100%, -50%)";
      break;
    case "right":
      base.left = rect.right + window.scrollX + offset;
      base.top = rect.top + rect.height / 2 + window.scrollY;
      base.transform = "translate(0, -50%)";
      break;
  }

  return createPortal(
    <div data-slot="hover-card-content" className={cn("p-overlaypanel bg-popover text-popover-foreground rounded-md border p-4 shadow-md z-50", className)} style={base} role="dialog">
      <div className="p-overlaypanel-content">{children}</div>
    </div>,
    document.body,
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
