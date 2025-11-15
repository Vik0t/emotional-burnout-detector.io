"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "./utils";

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function Popover({
  children,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (onOpenChange) onOpenChange(next);
      else setOpenState(next);
    },
    [onOpenChange],
  );

  const triggerRef = React.useRef<HTMLElement | null>(null);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div data-slot="popover" className={cn(className)} {...props}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

function PopoverTrigger({ children, className, ...props }: any) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) return null;

  const child = React.Children.only(children) as React.ReactElement<any>;
  const ref = (node: HTMLElement | null) => {
    ctx.triggerRef.current = node;
    const { ref: childRef } = child as any;
    if (typeof childRef === "function") childRef(node);
    else if (childRef) childRef.current = node;
  };

  const onClick = (e: any) => {
    ctx.setOpen(!ctx.open);
    child.props?.onClick?.(e);
  };

  return React.cloneElement(child, {
    ref,
    className: cn(child.props.className, className),
    onClick,
    ...props,
  });
}

function PopoverContent({
  className,
  align = "center",
  side = "bottom",
  offset = 8,
  children,
  hidden,
}: {
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  offset?: number;
  children?: React.ReactNode;
  hidden?: boolean;
}) {
  const ctx = React.useContext(PopoverContext);
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
      data-slot="popover-content"
      className={cn("p-overlaypanel", className)}
      style={style}
      data-side={side}
      data-align={align}
    >
      <div className="p-overlaypanel-content">{children}</div>
    </div>,
    document.body,
  );
}

function PopoverAnchor({ ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
