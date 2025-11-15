"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "./utils";

type TooltipContextValue = {
  open: boolean;
  show: () => void;
  hide: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function TooltipProvider({
  children,
  delayDuration = 0,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  const timerRef = React.useRef<number | null>(null);
  const show = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (delayDuration > 0) {
      timerRef.current = window.setTimeout(() => setOpen(true), delayDuration);
    } else {
      setOpen(true);
    }
  }, [delayDuration]);
  const hide = React.useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(false);
  }, []);

  return (
    <TooltipContext.Provider value={{ open, show, hide, triggerRef }}>
      {children}
    </TooltipContext.Provider>
  );
}

function Tooltip({
  children,
  delayDuration,
}: {
  children: React.ReactNode;
  delayDuration?: number;
}) {
  return <TooltipProvider delayDuration={delayDuration}>{children}</TooltipProvider>;
}

function TooltipTrigger({ children, asChild, className, ...props }: any) {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) return null;

  const child = React.Children.only(children) as React.ReactElement<any>;

  const ref = (node: HTMLElement | null) => {
    ctx.triggerRef.current = node;
    const { ref: childRef } = child as any;
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
    className: cn(child.props.className, className),
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...props,
  });
}

function TooltipContent({
  children,
  className,
  side = "top",
  align = "center",
  offset = 8,
  hidden = false,
}: {
  children: React.ReactNode;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  hidden?: boolean;
  offset?: number;
}) {
  const ctx = React.useContext(TooltipContext);
  const [style, setStyle] = React.useState<React.CSSProperties>({});

  React.useEffect(() => {
    if (!ctx) return;
    if (!ctx.open) return;
    const node = ctx.triggerRef.current;
    if (!node) return;
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

    setStyle(base);
  }, [ctx?.open, ctx?.triggerRef, side, offset]);

  if (!ctx || !ctx.open) return null;
  if (hidden) return null;

  return createPortal(
    <div
      role="tooltip"
      className={cn("p-tooltip", className)}
      style={style}
      data-side={side}
      data-align={align}
    >
      <div className="p-tooltip-text">{children}</div>
      <div className="p-tooltip-arrow" aria-hidden />
    </div>,
    document.body,
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
