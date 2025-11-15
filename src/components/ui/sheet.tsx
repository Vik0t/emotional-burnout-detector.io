"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Sheet({ children, open: openProp, defaultOpen = false, onOpenChange }: { children?: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = React.useState(openProp ?? defaultOpen);
  React.useEffect(() => {
    if (openProp !== undefined) setOpen(openProp);
  }, [openProp]);
  const setOpenState = (v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
  };

  return <div data-slot="sheet" role="presentation">{children && React.Children.map(children, (child) => child)}</div>;
}

function SheetTrigger({ children, onClick, ...props }: any) {
  const handleClick = (e: any) => {
    // Trigger behaviour handled by parent patterns; keep as passthrough
    if (onClick) onClick(e);
  };
  const child = React.Children.only(children) as React.ReactElement<any>;
  return React.cloneElement(child, { onClick: handleClick, ...props });
}

function SheetClose({ children, onClick, ...props }: any) {
  const child = React.Children.only(children) as React.ReactElement<any>;
  const handleClick = (e: any) => {
    if (onClick) onClick(e);
  };
  return React.cloneElement(child, { onClick: handleClick, ...props });
}

function SheetPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function SheetOverlay({ className, ...props }: { className?: string }) {
  return <div data-slot="sheet-overlay" className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />;
}

function SheetContent({ className, children, side = "right" }: { className?: string; children?: React.ReactNode; side?: "top" | "right" | "bottom" | "left" }) {
  const baseCls = cn("bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out rounded-md", className);
  const sideCls =
    side === "right"
      ? "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm"
      : side === "left"
      ? "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm"
      : side === "top"
      ? "inset-x-0 top-0 h-auto border-b"
      : "inset-x-0 bottom-0 h-auto border-t";

  return createPortal(
    <>
      <SheetOverlay />
      <div data-slot="sheet-content" className={cn(baseCls, sideCls)} role="dialog" aria-modal>
        {children}
        <button aria-label="Close" className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </>,
    document.body,
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 data-slot="sheet-title" className={cn("text-foreground font-semibold", className)} {...props} />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p data-slot="sheet-description" className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
