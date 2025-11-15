"use client";

import * as React from "react";

import { cn } from "./utils";

function ScrollArea({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
  return (
    <div data-slot="scroll-area" className={cn("p-scrollpanel relative overflow-auto", className)} {...props}>
      <div data-slot="scroll-area-viewport" className="p-scrollpanel-content size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
        {children}
      </div>
    </div>
  );
}

function ScrollBar({ className, orientation = "vertical" }: { className?: string; orientation?: "vertical" | "horizontal" }) {
  return (
    <div data-slot="scroll-area-scrollbar" className={cn("p-scrollpanel-bar", orientation === "vertical" ? "h-full" : "h-2.5", className)} />
  );
}

export { ScrollArea, ScrollBar };
