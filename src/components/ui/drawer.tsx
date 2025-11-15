"use client";

import * as React from "react";
import { cn } from "./utils";
import { Sheet, SheetOverlay, SheetContent, SheetPortal, SheetTrigger, SheetClose, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./sheet";

function Drawer({ children, open, defaultOpen, onOpenChange, side = "right", className, ...props }: { children?: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (v: boolean) => void; side?: "top" | "right" | "bottom" | "left"; className?: string } & React.ComponentProps<"div">) {
  return (
    <Sheet open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {children}
    </Sheet>
  );
}

function DrawerTrigger({ children, ...props }: any) {
  return <SheetTrigger {...props}>{children}</SheetTrigger>;
}

function DrawerPortal({ children }: { children?: React.ReactNode }) {
  return <SheetPortal>{children}</SheetPortal>;
}

function DrawerClose({ children, ...props }: any) {
  return <SheetClose {...props}>{children}</SheetClose>;
}

function DrawerOverlay({ className, ...props }: any) {
  return <SheetOverlay className={cn("fixed inset-0 z-50 bg-black/50", className)} {...props} />;
}

function DrawerContent({ className, children, side = "right", ...props }: { className?: string; children?: React.ReactNode; side?: "top" | "right" | "bottom" | "left" } & React.ComponentProps<"div">) {
  return (
    <SheetContent side={side} className={cn("group/drawer-content bg-background fixed z-50 flex h-auto flex-col ", className)} {...props}>
      <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
      {children}
    </SheetContent>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof SheetTitle>) {
  return (
    <SheetTitle data-slot="drawer-title" className={cn("text-foreground font-semibold", className)} {...props} />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof SheetDescription>) {
  return (
    <SheetDescription data-slot="drawer-description" className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
